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
  Select,
  FormControl,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { getVodInfo, getQualities, getVods } from "../services/vod";

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
  const oldVodInfo = JSON.parse(window.localStorage.getItem("downloadVod"));
  const defaultVodInfo = {
    vodId: "",
    title: "",
    author: "",
    timeSelected: "",
    showInstructions: false,
    filenames: [""],
    allTimes: [["00", "00", "00", "00", "00", "00"]],
    qualities: [],
    selectedQuality: "",
  };
  const classes = useStyles();
  const [url, setUrl] = React.useState(oldVodInfo.vodId);
  const [vodInfo, setVodInfo] = React.useState(oldVodInfo || defaultVodInfo);
  const [err, setErr] = React.useState("");
  const lookUp = () => {
    let id = "";
    for (const splitItem of url.trim().split("/"))
      if (splitItem.trim() !== "" && !isNaN(splitItem)) id = splitItem.trim();
    if (id === "") setErr("Input is badly formatted");
    else {
      getVodInfo(id)
        .then((data) => {
          getQualities(id)
            .then((qualities) => {
              const copy = {
                ...vodInfo,
                vodId: id,
                title: data.title,
                author: data.channel.display_name,
                qualities: qualities,
                selectedQuality: qualities[0],
              };
              window.localStorage.setItem("downloadVod", JSON.stringify(copy));
              setVodInfo(copy);
            })
            .catch((e) => setErr(`${e.message}`));
        })
        .catch((e) => setErr(`${e.message}`));
    }
  };
  const handleDownload = () => {
    const times = vodInfo.allTimes.map((timeArr, index) => {
      const startTime =
        parseInt(timeArr[0]) * 60 * 60 + timeArr[1] * 60 + timeArr[2] * 1;
      const endTime = timeArr[3] * 60 * 60 + timeArr[4] * 60 + timeArr[5] * 1;
      if (vodInfo.filenames[index] === "") return { startTime, endTime };
      return {
        startTime,
        endTime,
        filename: vodInfo.filenames[index].replace(/ /g, "_") + ".ts",
      };
    });
    const data = {
      quality: vodInfo.selectedQuality,
      id: vodInfo.vodId,
      times,
    };
    try {
      getVods(data);
    } catch (err) {
      setErr(err.message);
      setVodInfo(defaultVodInfo);
      window.localStorage.setItem(
        "downloadVod",
        JSON.stringify(defaultVodInfo)
      );
    }
  };
  const handleAddTime = () => {
    const newInfo = {
      ...vodInfo,
      allTimes: vodInfo.allTimes.concat([["00", "00", "00", "00", "00", "00"]]),
      filenames: vodInfo.filenames.concat(""),
    };
    setVodInfo(newInfo);
    window.localStorage.setItem("downloadVod", JSON.stringify(newInfo));
  };
  const handleKeyPress = (e) => {
    if (vodInfo.author !== "" && vodInfo.timeSelected !== "" && !isNaN(e.key)) {
      const currValue =
        vodInfo.allTimes[vodInfo.timeSelected[0]][vodInfo.timeSelected[1]];
      let newValue = "";
      let intValue = parseInt(e.key);
      newValue =
        vodInfo.timeSelected[1] === "0" || vodInfo.timeSelected[1] === "3"
          ? `${currValue[1]}${intValue}`
          : parseInt(currValue[1]) >= 6
          ? `0${intValue}`
          : `${currValue[1]}${intValue}`;

      const copy = [...vodInfo.allTimes];
      const copy2 = [...copy[vodInfo.timeSelected[0]]];
      copy2[vodInfo.timeSelected[1]] = newValue;
      copy[vodInfo.timeSelected[0]] = copy2;
      const newInfo = { ...vodInfo, allTimes: copy };
      setVodInfo(newInfo);
      window.localStorage.setItem("downloadVod", JSON.stringify(newInfo));
    }
  };
  const handleDelete = (index) => () => {
    if (vodInfo.allTimes.length === 1) return;
    const allTimesCopy = [...vodInfo.allTimes];
    allTimesCopy.splice(index, 1);
    const fileCopy = [...vodInfo.filenames];
    fileCopy.splice(index, 1);
    const newInfo = { ...vodInfo, allTimes: allTimesCopy, filenames: fileCopy };
    setVodInfo(newInfo);
    window.localStorage.setItem("downloadVod", JSON.stringify(newInfo));
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
          <Button variant="contained" color="primary" onClick={lookUp}>
            Look up
          </Button>
        </Grid>
        {vodInfo.author !== "" && (
          <Grid item xs={12}>
            <div className={classes.displayVodInfo}>
              <Typography component="h3" variant="h6">
                <b>{vodInfo.author}</b>: {vodInfo.title}
              </Typography>
              <br />
              <Button
                className={classes.instructionsButton}
                onClick={() => {
                  setVodInfo({
                    ...vodInfo,
                    showInstructions: !vodInfo.showInstructions,
                  });
                  window.localStorage.setItem(
                    "downloadVod",
                    JSON.stringify({
                      ...vodInfo,
                      showInstructions: !vodInfo.showInstructions,
                    })
                  );
                }}
                color="secondary"
                variant="contained"
                tabIndex={-1}
              >
                {vodInfo.showInstructions ? "Hide" : "Show"} instructions and
                settings
              </Button>
              {vodInfo.showInstructions && (
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
                  <br />
                  <FormControl>
                    <Select
                      labelId="selectQuality"
                      value={vodInfo.selectedQuality}
                      onChange={(event) => {
                        setVodInfo({
                          ...vodInfo,
                          selectedQuality: event.target.value,
                        });
                        window.localStorage.setItem(
                          "downloadVod",
                          JSON.stringify({
                            ...vodInfo,
                            selectedQuality: event.target.value,
                          })
                        );
                      }}
                    >
                      {vodInfo.qualities.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Video Quality</FormHelperText>
                  </FormControl>
                </div>
              )}
              <div className={classes.timePicker}>
                <List>
                  {new Array(vodInfo.allTimes.length).fill().map((_, index) => {
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
                                          vodInfo.timeSelected ===
                                          `${index}${subIndex}`
                                            ? classes.timeDisplay
                                            : {}
                                        }
                                        onFocus={() =>
                                          setVodInfo({
                                            ...vodInfo,
                                            timeSelected: `${index}${subIndex}`,
                                          })
                                        }
                                        onBlur={() =>
                                          setVodInfo({
                                            ...vodInfo,
                                            timeSelected: "",
                                          })
                                        }
                                        tabIndex={index * 6 + subIndex + 1}
                                      >
                                        {vodInfo.allTimes[index][subIndex]}
                                      </span>
                                      {subIndex !== 2 && subIndex !== 5 && ":"}
                                    </React.Fragment>
                                  );
                                })}
                              </Typography>
                            </>
                          }
                        />
                        <TextField
                          label="File name (optional)"
                          variant="outlined"
                          color="secondary"
                          onChange={(e) => {
                            const copy = [...vodInfo.filenames];
                            copy[index] = e.target.value;
                            setVodInfo({ ...vodInfo, filenames: copy });
                            window.localStorage.setItem(
                              "downloadVod",
                              JSON.stringify({ ...vodInfo, filenames: copy })
                            );
                          }}
                          margin="dense"
                          value={vodInfo.filenames[index]}
                        />
                      </ListItem>
                    );
                  })}
                </List>
                <br />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload}
                  className={classes.downloadButton}
                  tabIndex={6 * vodInfo.allTimes.length + 2}
                >
                  Download
                </Button>

                <Button
                  variant="contained"
                  onClick={handleAddTime}
                  color="primary"
                  className={classes.buttonTimeChange}
                  tabIndex={6 * vodInfo.allTimes.length + 3}
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
