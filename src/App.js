import React from "react";
import LookUp from "./components/LookUp";
import DownloadVod from "./components/DownloadVod";
import DownloadChat from "./components/DownloadChat";
import GetHighlights from "./components/GetHighlights";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core/styles";
import { AppBar, Tabs, Tab } from "@material-ui/core";
function App() {
  const [currTab, setCurrTab] = React.useState(0);
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Tabs
          variant="fullWidth"
          value={currTab}
          onChange={(_, newValue) => setCurrTab(newValue)}
        >
          <Tab label="Look Up Vod" />
          <Tab label="Download Vod" />
          <Tab label="Download Chat" />
          <Tab label="Get Highlights" />
        </Tabs>
      </AppBar>
      {currTab === 0 && <LookUp />}
      {currTab === 1 && <DownloadVod />}
      {currTab === 2 && <DownloadChat />}
      {currTab === 3 && <GetHighlights />}
    </ThemeProvider>
  );
}

export default App;
