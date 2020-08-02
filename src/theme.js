import { createMuiTheme } from "@material-ui/core/styles";
import { grey, amber } from "@material-ui/core/colors";

export default createMuiTheme({
  palette: {
    background: {
      default: grey[300],
      paper: grey[100],
    },
    primary: {
      main: "#ffb300",
      light: amber[200],
    },
    secondary: {
      main: "#7e5dc0",
    },
    error: {
      main: "#b71c1c",
    },
  },
});
