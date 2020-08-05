require("dotenv").config();
const express = require("express");
const getVodInfo = require("./twitchAPI/getVodInfo");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const app = express();

if (process.env.NODE_ENV === "production") {
  console.log("Production build...");
  app.use(express.static("build"));
} else {
  console.log("Development build...");
  app.use(cors());
}
app.get("/vod/getvodinfo/:id", (req, res) => {
  getVodInfo(req.params.id)
    .then((vodInfo) => {
      res.send(vodInfo);
    })
    .catch(() => {
      res.status(400).send("Bad id");
    });
});
app.listen(PORT, () => console.log("Server is ready on " + PORT));
