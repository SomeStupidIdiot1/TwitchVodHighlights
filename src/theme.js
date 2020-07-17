import { createMuiTheme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

export default createMuiTheme({
  palette: {
    background: {
      default: grey[300],
      paper: grey[100],
    },
  },
});
