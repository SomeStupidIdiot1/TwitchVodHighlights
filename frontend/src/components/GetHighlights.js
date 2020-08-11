import React from "react";
import {
  Typography,
  TextField,
  Container,
  Button,
  CssBaseline,
  Snackbar,
  Grid,
  TableHead,
  TableCell,
  Table,
  TableBody,
  TableRow,
  CircularProgress,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { getHighlights } from "../services/vod";

const useStyles = makeStyles((theme) => ({
  description: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
}));
const GetHighlights = () => {
  const classes = useStyles();
  const [url, setUrl] = React.useState(
    window.localStorage.getItem("getHighlightsId") || ""
  );
  const [err, setErr] = React.useState("");
  const [data, setData] = React.useState(
    window.localStorage.getItem("getHighlightsData")
      ? JSON.parse(window.localStorage.getItem("getHighlightsData"))
      : []
  );
  const [inProgress, setInProgress] = React.useState(false);

  const getHighlightsHandler = () => {
    let id = "";
    for (const splitItem of url.trim().split("/"))
      if (splitItem.trim() !== "" && !isNaN(splitItem)) id = splitItem.trim();
    if (id === "") setErr("Input is badly formatted");
    else {
      setInProgress(true);

      getHighlights(id)
        .then((result) => {
          window.localStorage.setItem("getHighlightsId", id);
          window.localStorage.setItem(
            "getHighlightsData",
            JSON.stringify(result.topSpeeds)
          );
          setData(result.topSpeeds);
        })
        .catch((err) => setErr(err.message))
        .finally(() => setInProgress(false));
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
            className={classes.textField}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={getHighlightsHandler}
            fullWidth
          >
            Get Highlights
          </Button>
        </Grid>
        <Grid item xs={12}>
          {inProgress && <CircularProgress color="secondary" />}
        </Grid>
      </Grid>
      {!inProgress && data.length !== 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Messages per second</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ speed, time }, index) => {
              const hours = time / 60 / 60;
              const minutes = (hours - ~~hours) * 60;
              const seconds = (minutes - ~~minutes) * 60;
              return (
                <TableRow key={index}>
                  <TableCell key={index}>{speed}</TableCell>
                  <TableCell>{`${~~hours}h ${~~minutes}m ${~~seconds}s`}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Snackbar open={err.length !== 0} onClose={() => setErr("")}>
        <Alert severity="error" onClose={() => setErr("")}>
          {err}
        </Alert>
      </Snackbar>
    </Container>
  );
};
export default GetHighlights;
