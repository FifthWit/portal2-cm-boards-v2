use actix_web::{get, body::Body, http::header, web, HttpResponse, Error};
use std::collections::HashMap;

use crate::db::DbPool;
use crate::models::Changelog;
use crate::models::SPMap;
use crate::models::CoopMap;

// Calls models::Changelog::all with a connection from the pool tog grab the test
// The web::block() moves the function outside of a blocking context onto another worker thread
#[get("/test/sp/")]
async fn dbpool_test(pool: web::Data<DbPool>) -> Result<HttpResponse, Error> {
    let conn = pool.get().expect("Could not get a DB connection from pool.");
    let cl = web::block(move || Changelog::all(&conn))
        .await
        .map_err(|e|{
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;
    if let Some(cl) = cl{
        Ok(HttpResponse::Ok().json(cl))
    } else {
        let res = HttpResponse::NotFound()
            .body("No changelog entries found.");
        Ok(res)
    }
}

// #[derive(Serialize)]
// pub struct spwithrank{
//     pub map_data: SPMap,
//     // Handle this
//     pub rank: i32,
//     // Handle this
//     pub score: f32,
// }

// Calls models::SPMap to grab the entries for a particular mapid, returns a vector of the top 200 times, in a slimmed down fashion (only essential data)
// Handles filtering out obsolete times (1 time per runner)
#[get("/maps/sp/{mapid}")]
async fn singleplayer_maps(mapid: web::Path<u64>, pool: web::Data<DbPool>) -> Result<HttpResponse, Error>{
    // Grabs a mysql db connection from a pool in the web::Data.
    let conn = pool.get().expect("Could not get a DB connection from pool.");
    // Async non-blocking call to grab the data from the database.
    let changelog_entries = web::block(move || SPMap::show(&conn, mapid.to_string()))
    .await
    .map_err(|e|{
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
    })?;
    // Check the contents of the Option, if it exists extract it. 
    if let Some(changelog_entries) = changelog_entries{
        // Filters out all obsolete times from the result, then truncates to 200 entries.
        let mut changelog_entries_filtered = Vec::new();
        let mut remove_dups: HashMap<String, i32> = HashMap::with_capacity(200);
        for entry in changelog_entries.iter(){
            match remove_dups.insert(entry.profile_number.clone(), 1){
                // If this returns, the profile_number has a better time, remove the time from the vector
                Some(_) => (),
                _ => changelog_entries_filtered.push(entry.clone()),
            }
        }
        changelog_entries_filtered.truncate(200);
        // Return a response ok and serialize the vector into a JSON object.
        Ok(HttpResponse::Ok().json(changelog_entries_filtered))
    } else {
        let res = HttpResponse::NotFound()
            .body("No changelog entries found.");
        Ok(res)
    }
}

// Calls models::CoopMap to grab the entries for a particular mapid, returns a vector of the top 200 times, in a slimmed down fashion (only essential data)
// Handles filtering out obsolete times (1 per runner, allowed for more than 1 if a time is with a player without a better time)
// TODO: Implement aliased queries (waiting on you diesel peer review team)
#[get("/maps/coop/{mapid}")]
async fn coop_maps(mapid: web::Path<u64>, pool: web::Data<DbPool>) -> Result<HttpResponse, Error>{
    let conn = pool.get().expect("Could not get a DB connection from pool.");
    let coopbundled_entries = web::block(move || CoopMap::show(&conn, mapid.to_string()))
    .await
    .map_err(|e|{
        eprintln!("{}", e);
        HttpResponse::InternalServerError().finish()
    })?;
    if let Some(coopbundled_entries) = coopbundled_entries{
        // Filters out all obsolete times from the result, then truncates to 200 entries.
        let mut coopbundled_entries_filtered = Vec::new();
        let mut remove_dups: HashMap<String, i32> = HashMap::with_capacity(500);
        remove_dups.insert("".to_string(), 1);
        for entry in coopbundled_entries{
            match remove_dups.insert(entry.profile_number1.clone(), 1){
                // If player 1 has a better time, check to see if player 2 doesn't.
                Some(_) => match remove_dups.insert(entry.profile_number2.clone(), 1){
                    Some(_) => (),
                    _ => coopbundled_entries_filtered.push(entry.clone()),
                }
                // This case handles if player 1 doesn't have a better time, and it tries to add player 2 in as well, if two has a better time or not, this is included.
                _ => match remove_dups.insert(entry.profile_number2.clone(), 1){
                    Some(_) => coopbundled_entries_filtered.push(entry.clone()),
                    _ => coopbundled_entries_filtered.push(entry.clone()),
                }
            }
        }
        coopbundled_entries_filtered.truncate(200);
        Ok(HttpResponse::Ok().json(coopbundled_entries_filtered))
    } else {
        let res = HttpResponse::NotFound()
            .body("No changelog entries found.");
        Ok(res)
    }
}


// Mounts the routes to /api/..
pub fn init(cfg: &mut web::ServiceConfig){
    cfg.service(
        web::scope("/api")
            .service(singleplayer_maps)
            .service(coop_maps)
            .service(dbpool_test)
    );
}