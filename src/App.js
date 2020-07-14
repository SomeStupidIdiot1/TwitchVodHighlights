import React from "react";
import { Typography, TextField, Container, Button } from "@material-ui/core";
import { getVodInfo } from "./twitchAPI/getVodInfo";

function App() {
  const [urls, setUrls] = React.useState("");
  const [vodData, setVodData] = React.useState({});
  const [errs, setErrs] = React.useState([]);
  const lookUp = () => {
    urls
      .split("\n")
      .map((url) => {
        url = url.trim();
        if (!isNaN(url)) return url;
        for (let splitItem of url.split("/")) {
          if (!isNaN(splitItem)) return splitItem;
        }
        setErrs(
          errs.concat(
            `Unable to get the url ${url}. The format is probably bad.`
          )
        );
        return "";
      })
      .forEach((id) => {
        if (id !== "") {
          getVodInfo(id)
            .then((data) => setVodData({ ...vodData, id: data }))
            .catch(() =>
              setErrs(
                errs.concat(
                  `Unable to get ${id}. Likely invalid or inaccessible.`
                )
              )
            );
        }
      });
      
  };
  return (
    <Container>
      <Typography variant="h5" component="h3">
        Put each twitch vod URL or twitch vod ID on a new line
      </Typography>
      <TextField
        multiline
        rowsMax={10}
        rows={4}
        variant="outlined"
        label="URLs"
        fullWidth
        onChange={(e) => setUrls(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={lookUp}>
        Look up URLs
      </Button>
    </Container>
  );
}

export default App;
