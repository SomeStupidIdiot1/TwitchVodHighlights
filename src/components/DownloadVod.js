import React from "react";
import {
  Typography,
  TextField,
  Container,
  Button,
  CssBaseline,
  Snackbar,
  Grid,
  List,
  ListItemText,
  ListItem,
  IconButton,
} from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import Alert from "@material-ui/lab/Alert";
import { getVodInfo } from "../twitchAPI/getVodInfo";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  displayVodInfo: {
    backgroundColor: theme.palette.background.paper,
    margin: 0,
    padding: theme.spacing(2),
  },
  textField: {
    marginBottom: theme.spacing(1),
  },
  description: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  timePicker: {
    cursor: "default",
  },
  listItem: {
    padding: 0,
  },
  timeDisplay: {
    width: 30,
    backgroundColor: theme.palette.primary.main,
  },
}));
const DownloadVod = () => {
  const initialId = window.localStorage.getItem("downloadVodLookUpId");
  const classes = useStyles();
  const [url, setUrl] = React.useState(initialId ? initialId : "");
  const [err, setErr] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [timeSelected, setTimeSelected] = React.useState([0]);
  const lookUp = () => {
    let id = "";
    for (const splitItem of url.trim().split("/"))
      if (splitItem.trim() !== "" && !isNaN(splitItem)) id = splitItem.trim();
    if (id === "") setErr(`Input is badly formatted`);
    else {
      getVodInfo(id)
        .then((data) => {
          setAuthor(data.channel.display_name);
          setTitle(data.title);
          window.localStorage.setItem("downloadVodLookUpId", id);
        })
        .catch((e) => setErr(`Could not access ${e.message}`));
    }
  };
  return (
    <Container maxWidth="md">
      <CssBaseline />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            component="h3"
            className={classes.description}
          >
            <b>This is used to downloads twitch vods.</b>
          </Typography>
          <TextField
            color="secondary"
            variant="outlined"
            label="Enter twitch vod URL or twitch vod ID."
            fullWidth
            value={url}
            className={classes.textField}
            onChange={(e) => {
              setUrl(e.target.value);
              setTitle("");
              setAuthor("");
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={lookUp}
            fullWidth
          >
            Look up
          </Button>
        </Grid>
        {author !== "" && (
          <Grid item xs={12}>
            <div className={classes.displayVodInfo}>
              <Typography component="h3" variant="h6">
                <b>{author}</b>: {title}
              </Typography>
              <br />
              <Typography component="h3" variant="subtitle1">
                Specify the time range of the vod to be downloaded.
              </Typography>
              <Typography component="h3" variant="subtitle1">
                Use TAB or click on the specific time cell to highlight it, then
                type in the number that you want.
              </Typography>
              <Typography component="h3" variant="subtitle1">
                Hours are limited from 0 to 99, with minutes and seconds being
                limited from 0 to 59.
              </Typography>
              <Typography component="h3" variant="subtitle1">
                If the time chosen is too long, then it will just go all the way
                to the end of the vod.
              </Typography>
              <Typography component="h3" variant="subtitle1">
                It is in the format of <b>hours : minutes : seconds</b>.
              </Typography>
              <div className={classes.timePicker}>
                <List>
                  {timeSelected.map((val, index) => {
                    return (
                      <ListItem key={index} className={classes.listItem}>
                        <IconButton
                          onClick={() => {}}
                          fontSize="large"
                          tabIndex={-1}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                        <ListItemText
                          primary={
                            <>
                              <Typography component="p" variant="h6">
                                {[0, 1, 2, 3, 4, 5].map((subIndex) => {
                                  return (
                                    <React.Fragment key={`${index}${subIndex}`}>
                                      {subIndex === 0 && "From "}
                                      {subIndex === 3 && " to "}
                                      <span
                                        className={
                                          val === subIndex
                                            ? classes.timeDisplay
                                            : {}
                                        }
                                        onClick={() => {
                                          const copy = [...timeSelected];
                                          copy[index] = subIndex;
                                          setTimeSelected(copy);
                                        }}
                                        onFocus={() => {
                                          const copy = [...timeSelected];
                                          copy[index] = subIndex;
                                          setTimeSelected(copy);
                                        }}
                                        tabIndex={subIndex}
                                      >
                                        00
                                      </span>
                                      {subIndex !== 2 && subIndex !== 5 && ":"}
                                    </React.Fragment>
                                  );
                                })}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </div>
            </div>
          </Grid>
        )}
      </Grid>
      <Snackbar open={err.length !== 0} onClose={() => setErr("")}>
        <Alert severity="error" onClose={() => setErr("")}>
          {err}
        </Alert>
      </Snackbar>
    </Container>
  );
};
export default DownloadVod;
