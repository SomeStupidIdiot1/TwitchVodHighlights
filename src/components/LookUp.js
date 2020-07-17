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
const useStyles = makeStyles((theme) => ({
  list: {
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    margin: theme.spacing(1, 0),
  },
}));

const LookUp = () => {
  const classes = useStyles();
  const [urls, setUrls] = React.useState("");
  const [vodData, setVodData] = React.useState([]);
  const [errs, setErrs] = React.useState([]);
  const [checked, setChecked] = React.useState([]);
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
      setVodData(data.filter((item) => item instanceof Object));
      setErrs(newErrs);
      setChecked(new Array(data.length).fill(true));
    });
  };
  const handleCheckbox = (index) => () => {
    const tmp = [...checked];
    tmp[index] = !tmp[index];
    setChecked(tmp);
  };
  return (
    <Container maxWidth="md">
      <CssBaseline />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h3" className={classes.title}>
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
              <List className={classes.list}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography color="primary">
                        <b>Vods</b>
                      </Typography>
                    }
                    color="primary"
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
            </>
          )}
        </Grid>
        <Grid item>
          {errs.length !== 0 && (
            <>
              <Typography component="h3" variant="h5">
                Errors
              </Typography>{" "}
              {errs.map((msg) => (
                <Typography key={msg}> {msg}</Typography>
              ))}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
export default LookUp;
