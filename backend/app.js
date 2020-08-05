require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const app = express();
const getVodInfo = require("./twitchAPI/getVodInfo");
const { getQualities } = require("./twitchAPI/getvod");

if (process.env.NODE_ENV === "production") {
  console.log("Production build...");
  app.use(express.static("build"));
} else {
  console.log("Development build...");
  app.use(cors());
}

app.get("/vod/vodinfo/:id", (req, res) => {
  getVodInfo(req.params.id)
    .then((vodInfo) => {
      res.send(vodInfo);
    })
    .catch(() => {
      res.status(400).end();
    });
});
app.get("/vod/vodqualities/:id", (req, res) => {
  getQualities(req.params.id)
    .then((qualities) => {
      res.send(qualities);
    })
    .catch(() => {
      res.status(400).end();
    });
});

app.listen(PORT, () => console.log("Server is ready on " + PORT));
