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
import { makeStyles } from "@material-ui/core/styles";
import { downloadSimpleChat, downloadChatJson } from "../services/vod";
const useStyles = makeStyles((theme) => ({
  description: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
}));
const DownloadChat = () => {
  const classes = useStyles();
  const [url, setUrl] = React.useState(
    window.localStorage.getItem("downloadChatId") || ""
  );
  const [err, setErr] = React.useState("");
  const getId = () => {
    let id = "";
    for (const splitItem of url.trim().split("/"))
      if (splitItem.trim() !== "" && !isNaN(splitItem)) id = splitItem.trim();
    if (id === "") setErr("Input is badly formatted");
    else {
      window.localStorage.setItem("downloadChatId", id);
      return id;
    }
  };
  const downloadSimple = async () => {
    const id = getId();
    if (id) {
      try {
        await downloadSimpleChat(id);
      } catch (err) {
        setErr(err.message);
      }
    }
  };
  const downloadJson = async () => {
    const id = getId();
    if (id) {
      try {
        await downloadChatJson(id);
      } catch (err) {
        setErr(err.message);
      }
    }
  };
  return (
    <Container maxWidth="md">
      <CssBaseline />
      <Grid container spacing={1}>
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
            onChange={(e) => setUrl(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={downloadSimple}>
            Download simple chat (text file)
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={downloadJson}>
            Download complicated chat (JSON file)
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
export default DownloadChat;
