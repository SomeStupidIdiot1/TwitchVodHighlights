import React from "react";
import {
  Typography,
  TextField,
  Container,
  Button,
  CssBaseline,
  Snackbar,
  Grid,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { getVodInfo } from "../twitchAPI/getVodInfo";
import { makeStyles } from "@material-ui/core/styles";

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
const DownloadVod = () => {
  const classes = useStyles();
  const [url, setUrl] = React.useState("");
  const [err, setErr] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
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
