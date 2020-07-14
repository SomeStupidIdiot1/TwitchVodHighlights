import React from "react";
import { Typography, TextField, Container } from "@material-ui/core";

function App() {
  return (
    <Container>
      <Typography>
        Put each twitch vod URL or twitch vod ID on a new line
      </Typography>
      <TextField
        multiline
        rowsMax={10}
        rows={4}
        variant="outlined"
        label="URLs"
      >
        tests
      </TextField>
    </Container>
  );
}

export default App;
