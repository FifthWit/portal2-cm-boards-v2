import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { useStyles } from "./style";
import { Link } from "react-router-dom";

function ChamberCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.chamber_card}>
      <CardActionArea>
        <Link to={`/coop/${props.level_id}`}>
          <CardMedia
            className={classes.chamber_img}
            image={props.image}
            title="Container Ride"
          />
        </Link>
      </CardActionArea>
      <div className={classes.level_title_helper}></div>
      <div className={classes.level_title}>{props.title}</div>
      <CardContent className={classes.first_place}>
        <Grid container direction="row" justify="space-between">
          <Typography variant="body2">
            {`${props.scores[0].user_name1} & ${props.scores[0].user_name2}`}
          </Typography>
          <Typography variant="body2">{props.scores[0].score}</Typography>
        </Grid>
      </CardContent>
      {props.scores.map((score, i) => {
        if (i > 0) {
          return (
            <CardContent
              key={score.score + score.steamname1}
              className={classes.card_content}
            >
              <Grid container direction="row" justify="space-between">
                <Typography variant="caption">
                  {`${score.user_name1} & ${score.user_name2}`}
                </Typography>
                <Typography variant="caption">{score.score}</Typography>
              </Grid>
            </CardContent>
          );
        }
      })}
    </Card>
  );
}

export default ChamberCard;
