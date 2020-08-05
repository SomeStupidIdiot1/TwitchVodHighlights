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
    backgroundColor: theme.palette.info.main,
  },
  downloadButton: {
    marginRight: theme.spacing(2),
  },
  buttonTimeChange: {
    marginRight: theme.spacing(2),
  },
  instructionsButton: {
    marginBottom: theme.spacing(1),
  },
  instructions: {
    marginLeft: theme.spacing(1),
  },
}));
const DownloadVod = () => {
  const initialId = window.localStorage.getItem("downloadVodLookUpId");
  const classes = useStyles();
  const [url, setUrl] = React.useState(initialId ? initialId : "");
  const [err, setErr] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [timeSelected, setTimeSelected] = React.useState("");
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [allTimes, setAllTimes] = React.useState([
    ["00", "00", "00", "00", "00", "00"],
  ]);
  const lookUp = () => {
    let id = "";
    setAuthor("");
    setTitle("");
    for (const splitItem of url.trim().split("/"))
      if (splitItem.trim() !== "" && !isNaN(splitItem)) id = splitItem.trim();
    if (id === "") setErr("Input is badly formatted");
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
  const handleDownload = (combined) => () => {};
  const handleAddTime = () => {
    setAllTimes(allTimes.concat([["00", "00", "00", "00", "00", "00"]]));
  };
  const handleKeyPress = (e) => {
    if (author !== "" && timeSelected !== "" && !isNaN(e.key)) {
      const currValue = allTimes[timeSelected[0]][timeSelected[1]];
      let newValue = "";
      let intValue = parseInt(e.key);
      newValue =
        timeSelected[1] === "0" || timeSelected[1] === "3"
          ? `${currValue[1]}${intValue}`
          : parseInt(currValue[1]) >= 6
            ? `0${intValue}`
            : `${currValue[1]}${intValue}`;

      const copy = [...allTimes];
      const copy2 = [...copy[timeSelected[0]]];
      copy2[timeSelected[1]] = newValue;
      copy[timeSelected[0]] = copy2;
      setAllTimes(copy);
    }
  };
  const handleDelete = (index) => () => {
    if (allTimes.length === 1) return;
    const allTimesCopy = [...allTimes];
    allTimesCopy.splice(index, 1);
    setAllTimes(allTimesCopy);
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
            onChange={(e) => setUrl(e.target.value)}
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
              <Button
                className={classes.instructionsButton}
                onClick={() => setShowInstructions(!showInstructions)}
                color="secondary"
                variant="contained"
                tabIndex={-1}
              >
                {showInstructions ? "Hide" : "Show"} instructions and settings
              </Button>
              {showInstructions && (
                <div className={classes.instructions}>
                  <Typography component="h3" variant="subtitle1">
                    Specify the time range of the vod in the format of{" "}
                    <b>hours : minutes : seconds</b>.
                  </Typography>
                  <Typography component="h3" variant="subtitle1">
                    Use <b>Tab</b> or <b>click on the specific time cell</b>,
                    then type in the number that you want.
                  </Typography>
                  <Typography component="h3" variant="subtitle1">
                    Hours are limited from 0 to 99, with minutes and seconds
                    being limited from 0 to 59.
                  </Typography>
                  <Typography component="h3" variant="subtitle1">
                    If the time chosen is too long, then it will just go all the
                    way to the end of the vod.
                  </Typography>
                </div>
              )}
              <div className={classes.timePicker}>
                <List>
                  {new Array(allTimes.length).fill().map((_, index) => {
                    return (
                      <ListItem key={index} className={classes.listItem}>
                        <IconButton
                          fontSize="large"
                          tabIndex={-1}
                          onClick={handleDelete(index)}
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
                                        onKeyDown={handleKeyPress}
                                        className={
                                          timeSelected === `${index}${subIndex}`
                                            ? classes.timeDisplay
                                            : {}
                                        }
                                        onFocus={() =>
                                          setTimeSelected(`${index}${subIndex}`)
                                        }
                                        onBlur={() => setTimeSelected("")}
                                        tabIndex={index * 6 + subIndex + 1}
                                      >
                                        {allTimes[index][subIndex]}
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
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload(false)}
                  className={classes.downloadButton}
                  tabIndex={6 * allTimes.length + 2}
                >
                  Download Separately
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload(true)}
                  className={classes.downloadButton}
                  tabIndex={6 * allTimes.length + 3}
                >
                  Download Combined
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddTime}
                  color="primary"
                  className={classes.buttonTimeChange}
                  tabIndex={6 * allTimes.length + 4}
                >
                  Add another time range
                </Button>
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
