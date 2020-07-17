import React from "react";
import LookUp from "./components/LookUp";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core/styles";
function App() {
  return (
    <ThemeProvider theme={theme}>
      <LookUp />;
    </ThemeProvider>
  );
}

export default App;
