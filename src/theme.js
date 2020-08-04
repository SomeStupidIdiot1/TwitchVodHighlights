import { createMuiTheme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

export default createMuiTheme({
  palette: {
    background: {
      default: grey[300],
      paper: grey[100],
    },
    primary: {
      main: "#7e5dc0",
    },
    secondary: {
      main: "#bf360c",
    },
    error: {
      main: "#b71c1c",
    },
  },
});
