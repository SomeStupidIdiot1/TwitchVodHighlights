import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  TextField,
  Container,
  Button,
  List,
  ListItem,
  CssBaseline,
  Grid,
  ListItemIcon,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@material-ui/core";
import { getVodInfo, downloadMetadata } from "../services/vod";

const useStyles = makeStyles((theme) => ({
  vods: {
    backgroundColor: theme.palette.background.paper,
  },
  description: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  errs: {
    backgroundColor: theme.palette.background.paper,
  },
  downloadButton: {
    marginRight: theme.spacing(2),
  },
  textField: {
    marginBottom: theme.spacing(1),
  },
}));

const LookUp = () => {
  const pastVodData = JSON.parse(window.localStorage.getItem("pastVodData"));
  const classes = useStyles();
  const [urls, setUrls] = React.useState("");
  const [vodData, setVodData] = React.useState(pastVodData || []);
  const [errs, setErrs] = React.useState([]);
  const [checked, setChecked] = React.useState(
    pastVodData ? new Array(pastVodData.length).fill(true) : []
  );
  const [inProgress, setInProgress] = React.useState(false);
  const lookUp = () => {
    setChecked([]);
    setInProgress(true);
    const newVodData = [];
    const newErrs = [];
    new Set(
      urls
        .split("\n")
        .map((url) => {
          url = url.trim();
          if (!isNaN(url)) return url;
          for (const splitItem of url.split("/")) {
            if (splitItem.trim() !== "" && !isNaN(splitItem))
              return splitItem.trim();
          }
          newErrs.push(`Bad format: ${url}`);
          return "";
        })
        .filter((id) => id !== "")
    ).forEach((id) => {
      newVodData.push(getVodInfo(id).catch((e) => newErrs.push(e.message)));
    });
    Promise.all(newVodData).then((data) => {
      const filteredData = vodData.concat(
        data.filter((item) => item instanceof Object)
      );
      const removedDuplicates = [];
      for (let i = 0; i < filteredData.length; i++) {
        let hasDuplicate = false;
        for (let j = i + 1; j < filteredData.length; j++) {
          if (filteredData[i]._id === filteredData[j]._id) {
            hasDuplicate = true;
            break;
          }
        }
        if (!hasDuplicate) removedDuplicates.push(filteredData[i]);
      }
      setVodData(removedDuplicates);
      window.localStorage.setItem(
        "pastVodData",
        JSON.stringify(removedDuplicates)
      );
      setInProgress(false);
      setErrs(newErrs);
      setChecked(new Array(removedDuplicates.length).fill(true));
    });
  };
  const handleCheckbox = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) newChecked.push(value);
    else newChecked.splice(currentIndex, 1);

    setChecked(newChecked);
  };
  const handleDelete = () => {
    const newVodData = [];
    for (let i = 0; i < vodData.length; i++) {
      if (checked.indexOf(vodData[i]._id) === -1) newVodData.push(vodData[i]);
    }
    setVodData(newVodData);
    setChecked(new Array(newVodData.length).fill(false));
    window.localStorage.setItem("pastVodData", JSON.stringify(newVodData));
  };
  const handleDownload = () => {
    const actualMetadata = [];
    vodData.forEach((val) => {
      if (checked.indexOf(val._id) !== -1) actualMetadata.push(val);
    });
    downloadMetadata(actualMetadata);
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
            <b>This is used to get the metadata of twitch vods.</b>
          </Typography>
          <TextField
            multiline
            rowsMax={10}
            rows={4}
            color="secondary"
            variant="outlined"
            label="On each new line, put a twitch vod URL or twitch vod ID."
            fullWidth
            className={classes.textField}
            onChange={(e) => setUrls(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={lookUp}>
            Look up
          </Button>
        </Grid>
        <Grid item>{inProgress && <CircularProgress color="secondary" />}</Grid>
        <Grid item xs={12}>
          {vodData.length !== 0 && (
            <>
              <List className={classes.vods}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography>
                        <b>Vods</b>
                      </Typography>
                    }
                  />
                </ListItem>
                {vodData.map((data) => (
                  <ListItem
                    button
                    key={data._id}
                    onClick={handleCheckbox(data._id)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checked.indexOf(data._id) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography>
                        <b>{data.channel.display_name}:</b> {data.title}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
              <br />
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownload}
                className={classes.downloadButton}
              >
                Download metadata
              </Button>
              <Button
                variant="contained"
                onClick={handleDelete}
                color="primary"
              >
                Delete
              </Button>
            </>
          )}
        </Grid>
        <Grid item xs={12}>
          {errs.length !== 0 && (
            <List className={classes.errs}>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography color="error">
                      <b>Failed to get the following vods</b>
                    </Typography>
                  }
                />
              </ListItem>
              {errs.map((msg) => (
                <ListItem key={msg}>
                  <Typography>{msg}</Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
export default LookUp;
