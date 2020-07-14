import React from "react";
import { Typography, TextField, Container, Button } from "@material-ui/core";
import { getVodInfo } from "../twitchAPI/getVodInfo";

const LookUp = () => {
  const [urls, setUrls] = React.useState("");
  const [vodData, setVodData] = React.useState({});
  const [errs, setErrs] = React.useState([]);
  const lookUp = () => {
    setVodData({});
    setErrs([]);
    urls
      .split("\n")
      .map((url) => {
        url = url.trim();
        if (!isNaN(url)) return url;
        for (let splitItem of url.split("/")) {
          if (splitItem.trim() !== "" && !isNaN(splitItem))
            return splitItem.trim();
        }
        setErrs(errs.concat(`Bad format: ${url}`));
        return "";
      })
      .forEach((id) => {
        if (id !== "") {
          getVodInfo(id)
            .then((data) => {
              console.log(data);
              setVodData({ ...vodData, id: data });
            })
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
      <div>{JSON.stringify(vodData)}</div>
      <div>{errs.length && errs[0]}</div>
    </Container>
  );
};
export default LookUp;
