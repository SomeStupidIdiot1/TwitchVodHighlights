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
} from "@material-ui/core";
import { getVodInfo } from "../twitchAPI/getVodInfo";
import { saveAs } from "file-saver";

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
  deleteButton: {
    background: theme.palette.primary.light,
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
  const [vodData, setVodData] = React.useState(pastVodData ? pastVodData : []);
  const [errs, setErrs] = React.useState([]);
  const [checked, setChecked] = React.useState(
    pastVodData ? new Array(pastVodData.length).fill(true) : []
  );
  const lookUp = () => {
    setChecked([]);
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
      setErrs(newErrs);
      setChecked(new Array(removedDuplicates.length).fill(true));
    });
  };
  const handleCheckbox = (index) => () => {
    const tmp = [...checked];
    tmp[index] = !tmp[index];
    setChecked(tmp);
  };
  const handleDelete = () => {
    const newVodData = [];
    for (let i = 0; i < checked.length; i++) {
      if (!checked[i]) newVodData.push(vodData[i]);
    }
    setVodData(newVodData);
    setChecked(new Array(newVodData.length).fill(false));
    window.localStorage.setItem("pastVodData", JSON.stringify(newVodData));
  };
  const handleDownload = () => {
    saveAs(
      new Blob([JSON.stringify(vodData)], {
        type: "text/plain;charset=utf-8",
      }),
      "vodsMetadata.json"
    );
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
            <b>
              This is used to get the metadata of a twitch vod. On each new
              line, put a twitch vod URL or twitch vod ID.
            </b>
          </Typography>
          <TextField
            multiline
            rowsMax={10}
            rows={4}
            color="secondary"
            variant="outlined"
            label="URLs"
            fullWidth
            className={classes.textField}
            onChange={(e) => setUrls(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={lookUp}
            fullWidth
          >
            Look up URLs
          </Button>
        </Grid>
        <Grid item xs={12}>
          {vodData.length !== 0 && (
            <>
              <List className={classes.vods}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography color="secondary">
                        <b>Vods</b>
                      </Typography>
                    }
                  />
                </ListItem>
                {vodData.map((data, index) => (
                  <ListItem
                    button
                    key={data._id}
                    onClick={handleCheckbox(index)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={!!checked[index]}
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
                className={classes.deleteButton}
                variant="contained"
                onClick={handleDelete}
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
