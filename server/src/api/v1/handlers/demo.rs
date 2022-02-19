use anyhow::Result;
use actix_multipart::Multipart;
use actix_web::{post, web, HttpResponse, Responder};
use futures::{StreamExt, TryStreamExt};
use raze::api::*;
use raze::utils::*;
use std::fs::remove_file;
use std::fs::OpenOptions;
use std::io::Write;
use sqlx::PgPool;
use chrono::NaiveDateTime;
use crate::config::Config;
use crate::tools::datamodels::{Demos, DemoInsert, ChangelogInsert, CalcValues};
use std::str;

//  a. Handle renaming/db interactions (update demo table/specific time that is being uploaded)
//  b. Pass to backblaze
//  c. Look to see if there is anything special needed for auto-submit
//  d. Integrate Parsing
// Code Reference: https://github.com/Ujang360/actix-multipart-demo/blob/main/src/main.rs
#[post("/demo")]
pub async fn receive_multiparts(mut payload: Multipart, config: web::Data<Config>, pool: web::Data<PgPool>) -> impl Responder {
    let mut file_id: Option<String> = None;
    let mut values = DemoInsert::default();
    //println!("{} - {} - {}", config.backblaze.keyid, config.backblaze.key, config.backblaze.bucket);
    while let Ok(Some(mut field)) = payload.try_next().await {
        // Note: content_disposition() now returns a &ContentDisposition, rather than an Option<ContentDisposition>
        let mut content_data = Vec::new();
        while let Some(Ok(chunk)) = field.next().await {
            content_data.extend(chunk);
        }
        let field_name = field.content_disposition().get_name().unwrap_or_else(|| "NO-KEY-PROVIDED");
        let file_name = field.content_disposition().get_filename();
        // Handle the case where we were passed a file
        if let Some(file_name) = file_name {
            use std::fs;
            match fs::create_dir_all("./demos") {
                Ok(_) => (),
                Err(e) => {
                    return HttpResponse::InternalServerError()
                        .body(format!("Failed to create demo directory locally -> {}", e))
                },
            }
            let file = OpenOptions::new()
                .create(true)
                .write(true)
                .open(format!("./demos/{}", file_name));
            match file {
                Ok(mut res) => match res.write_all(&content_data) {
                    Ok(_) => (),
                    Err(e) => {
                        return HttpResponse::InternalServerError()
                            .body(format!("Failed to write demo locally -> {}", e))
                    }
                },
                Err(e) => {
                    return HttpResponse::InternalServerError()
                        .body(format!("Failed to write demo locally -> {}", e))
                }
            };
            // TODO: Parse Demo
            file_id = match upload_demo(&config, &file_name).await {
                Ok(fid) => fid,
                Err(e) => {
                    eprintln!("Error with File upload -> {:?}", e);
                    None
                },
            };
            
            // Delete Demo
            let res = remove_file(format!("./demos/{}", file_name));
            match res {
                Ok(_) => (),
                Err(e) => {
                    return HttpResponse::InternalServerError()
                        .body(format!("Failed to delete demo locally -> {}", e))
                }
            }
        } else {
            // Handle the case where we are passed a text value.
            let result_string = match str::from_utf8(&content_data) {
                Ok(our_string) => our_string,
                Err(e) => {
                    eprintln!("Invalid UTF-8 sequence: {}", e);
                    "ERROR"
                }
            };
            match field_name {
                "partner_name" => values.partner_name = Some(result_string.to_string()),
                "parsed_successfully" => {
                    values.parsed_successfully = {
                        match result_string {
                            "false" => false,
                            "true" => true,
                            _ => false,
                        }
                    }
                }
                "sar_version" => values.sar_version = Some(result_string.to_string()),
                "cl_id" => values.cl_id = result_string.parse::<i64>().unwrap_or(0),
                _ => eprintln!("Got an unexpected field."),
            }
        }
    }
    if let Some(file_id) = file_id {
        values.file_id = file_id;
    }
    //println!("{:#?}", values);
    let res = Demos::insert_demo(&pool, values).await;
    match res {
        Ok(id) => HttpResponse::Ok().json(id),
        Err(e) => HttpResponse::InternalServerError().body(format!("Failed to add demo to database -> {}", e)),
    }
}

async fn upload_demo(config: &web::Data<Config>, file_name: &str) -> Result<Option<String>> {
    let client = reqwest::ClientBuilder::new().build().unwrap();
    // Ref: https://docs.rs/raze/0.4.1/raze/api/fn.b2_authorize_account.html
    let auth = b2_authorize_account(
        &client,
        format!("{}:{}", config.backblaze.keyid, config.backblaze.key)
    )
    .await
    .unwrap();
    let upload_auth = b2_get_upload_url(&client, &auth, config.backblaze.bucket.clone())
        .await
        .unwrap();
    let file = tokio::fs::File::open(format!("./demos/{}", file_name))
        .await
        .unwrap();
    let metadata = file.metadata().await.unwrap();
    let size = metadata.len();
    let modf = metadata
        .modified()
        .unwrap()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
        * 1000;

    let param = FileParameters {
        file_path: file_name,
        file_size: size,
        content_type: None,
        content_sha1: Sha1Variant::HexAtEnd,
        last_modified_millis: modf,
    };

    let stream = reader_to_stream(file);
    let stream = BytesStreamHashAtEnd::wrap(stream);
    let stream = BytesStreamThrottled::wrap(stream, 500000000);

    let body = reqwest::Body::wrap_stream(stream);
    let resp1 = b2_upload_file(&client, &upload_auth, body, param)
        .await
        .unwrap();
    Ok(resp1.file_id)
}

/// Should parse a changelog upload built using forms, with a demo file upload.
#[post("/demos/changelog")]
pub async fn changelog_with_demo(mut payload: Multipart, config: web::Data<Config>, pool: web::Data<PgPool>) -> impl Responder {
    let mut file_id: Option<String> = None;
    let mut changelog_insert = ChangelogInsert::default();
    let mut demo_insert = DemoInsert::default();
    while let Ok(Some(mut field)) = payload.try_next().await {
        let mut content_data = Vec::new();
        while let Some(Ok(chunk)) = field.next().await {
            content_data.extend(chunk);
        }
        let field_name = field.content_disposition().get_name().unwrap_or_else(|| "NO-KEY-PROVIDED");
        let file_name = field.content_disposition().get_filename();

        if let Some(file_name) = file_name {
            use std::fs;
            match fs::create_dir_all("./demos") {
                Ok(_) => (),
                Err(e) => return HttpResponse::InternalServerError().body(format!("Failed to create demo directory locally -> {}", e)),
            }
            let file = OpenOptions::new()
                .create(true)
                .write(true)
                .open(format!("./demos/{}", file_name));
            match file {
                Ok(mut res) => match res.write_all(&content_data) {
                    Ok(_) => (),
                    Err(e) => {
                        return HttpResponse::InternalServerError()
                            .body(format!("Failed to write demo locally -> {}", e))
                    }
                },
                Err(e) => {
                    return HttpResponse::InternalServerError()
                        .body(format!("Failed to write demo locally -> {}", e))
                }
            };
            // TODO: Parse Demo
            file_id = match upload_demo(&config, &file_name).await {
                Ok(fid) => fid,
                Err(e) => {
                    eprintln!("Error with File upload -> {:?}", e);
                    None
                },
            };
            
            // Delete Demo
            let res = remove_file(format!("./demos/{}", file_name));
            match res {
                Ok(_) => (),
                Err(e) => {
                    return HttpResponse::InternalServerError()
                        .body(format!("Failed to delete demo locally -> {}", e))
                }
            }
        } else {
            // Handle the case where we are passed a text value.
            let result_string = str::from_utf8(&content_data).unwrap_or("ERROR");
            match field_name {
                "timestamp" => {
                    changelog_insert.timestamp = 
                        match NaiveDateTime::parse_from_str(result_string, "%Y-%m-%d %H:%M:%S") {
                            Ok(val) => Some(val),
                            Err(e) => None,
                        }
                },
                "profile_number" => changelog_insert.profile_number = result_string.to_string(),
                "score" => { 
                    changelog_insert.score = 
                    match result_string.parse::<i32>() {
                        Ok(val) => val, 
                        Err(e) => return HttpResponse::BadRequest().body("Invalid score, could not parse"),
                    }
                },
                "map_id" => changelog_insert.map_id = result_string.to_string(),
                "demo_id" => changelog_insert.demo_id = None, // TODO: Maybe fix this?
                "banned" => changelog_insert.banned = false,
                "youtube_id" => changelog_insert.youtube_id = Some(result_string.to_string()),
                "coop_id"  => changelog_insert.coop_id =  None,
                "submission" => changelog_insert.submission = true, // TODO: Check defaults
                "note" => changelog_insert.note = Some(result_string.to_string()),
                "category_id" => { 
                    changelog_insert.category_id = 
                    match result_string.parse::<i32>() {
                        Ok(val) => val, 
                        Err(_) => return HttpResponse::BadRequest().body("Invalid category_id, could not parse"),
                    }
                },
                _ => (),
            }
            // Make sure these are not defaults before we use them for calculating score information
            if changelog_insert.score != 0 && !changelog_insert.profile_number.is_empty() && !changelog_insert.map_id.is_empty() {
                use super::sp::check_for_valid_score;
                let res = check_for_valid_score(&pool, 
                    changelog_insert.profile_number.clone(),
                    changelog_insert.score.clone(),
                    changelog_insert.map_id.clone())
                    .await;
                match res {
                    Ok(details) => {
                        // TODO: NEED TO FIX THIS i32
                        if !details.banned {
                            changelog_insert.previous_id = details.previous_id;
                            changelog_insert.post_rank = details.post_rank;
                            changelog_insert.pre_rank = details.pre_rank;
                            changelog_insert.score_delta = details.score_delta;
                        }
                        else {
                            // USER IS BANNED, DO NOT ADD A TIME FOR THEM
                            return HttpResponse::NotFound().body("User is banned");
                        }
                    },
                    Err(e) => {
                        eprintln!("Error finding newscore details -> {:#?}", e);
                        // Cannot find user.
                    },
                }
            }
        }
    }
    // TODO: Insert changelog values
    if let Some(file_id) = file_id {
        demo_insert.file_id = file_id;
    }
    //println!("{:#?}", values);
    let res = Demos::insert_demo(&pool, demo_insert).await;
    match res {
        Ok(id) => HttpResponse::Ok().json(id),
        Err(e) => HttpResponse::InternalServerError().body(format!("Failed to add demo to database -> {}", e)),
    }
}