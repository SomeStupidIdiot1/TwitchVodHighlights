import React from "react";
import { Typography, TextField, Container, Button } from "@material-ui/core";
import { getVodInfo } from "../twitchAPI/getVodInfo";

const LookUp = () => {
  const [urls, setUrls] = React.useState("");
  const [vodData, setVodData] = React.useState([]);
  const [errs, setErrs] = React.useState([]);
  const lookUp = () => {
    const newVodData = [];
    const newErrs = [];
    // https://www.twitch.tv/videos/679365428
    new Set(
      urls
        .split("\n")
        .map((url) => {
          url = url.trim();
          if (!isNaN(url)) return url;
          for (let splitItem of url.split("/")) {
            if (splitItem.trim() !== "" && !isNaN(splitItem))
              return splitItem.trim();
          }
          newErrs.push(`Bad format: ${url}`);
          return "";
        })
        .filter((id) => id !== "")
    ).forEach((id) => {
      newVodData.push(getVodInfo(id).catch((e) => newErrs.push(e)));
    });
    Promise.all(newVodData).then((data) => {
      setVodData(data.filter((item) => item instanceof Object));
      setErrs(newErrs);
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
      {vodData.map((data) => (
        <Typography key={data._id}>
          <b>{data.channel.display_name}:</b> {data.title}
        </Typography>
      ))}
      {errs.map((e) => (
        <Typography key={e.id}>{e.message}</Typography>
      ))}
    </Container>
  );
};
export default LookUp;
