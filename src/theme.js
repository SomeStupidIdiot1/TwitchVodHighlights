import { createMuiTheme } from "@material-ui/core/styles";

export default createMuiTheme({
  palette: {
    type: "dark",
    background: {
      default: "#1C1C1E",
      paper: "#2C2C2E",
    },
    primary: {
      main: "#512da8",
    },
    secondary: {
      main: "#6a1b9a",
    },
    error: {
      main: "#b71c1c",
    },
  },
});
