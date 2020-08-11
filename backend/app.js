require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const app = express();
const getVodInfo = require("./twitchAPI/getVodInfo");
const { getQualities, getVideo } = require("./twitchAPI/getvod");
const fse = require("fs-extra");
const electron = require("electron");
const path = require("path");
const {
  getSimpleComments,
  getCommentsJson,
} = require("./twitchAPI/getComments");
const { getChatSpeed } = require("./twitchAPI/getHighlights");
if (process.env.NODE_ENV === "production") {
  console.log("Production build...");
  app.use(express.static("build"));
} else {
  console.log("Development build...");
  app.use(cors());
}
app.use(express.json());

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
app.post("/vod/voddownload", (req, res) => {
  // data: {quality: ???, id: ??? times: [{startTime, endTime, filename}]}
  const data = req.body;
  electron.dialog
    .showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: electron.app.getPath("downloads"),
    })
    .then((value) => {
      if (!value.canceled) {
        for (let i = 0; i < data.times.length; i++) {
          getVideo(
            data.id,
            data.times[i].startTime,
            data.times[i].endTime,
            data.quality,
            value.filePaths[0],
            data.times[i].filename
          );
        }
      }
    });
  res.status(200).end();
});
app.post("/jsondownload", (req, res) => {
  electron.dialog
    .showSaveDialog({
      defaultPath: path.resolve(
        electron.app.getPath("downloads"),
        "vodmetadata.json"
      ),
    })
    .then((value) => {
      if (!value.canceled) {
        fse.writeFile(value.filePath, JSON.stringify(req.body));
      }
    });
  res.status(200).end();
});
app.get("/vod/simplechat/:id", (req, res) => {
  electron.dialog
    .showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: electron.app.getPath("downloads"),
    })
    .then((value) => {
      if (!value.canceled) {
        getSimpleComments(req.params.id)
          .then((comments) => {
            let finalComment = "";
            comments.forEach(({ name, message, offset_seconds }) => {
              const hours = offset_seconds / 60 / 60;
              const minutes = (hours - ~~hours) * 60;
              const seconds = (minutes - ~~minutes) * 60;
              finalComment += `${name} [${~~hours}h ${~~minutes}m ${~~seconds}s]: ${message}\n`;
            });
            fse.writeFileSync(
              `${value.filePaths[0]}\\commentsFor${req.params.id}.txt`,
              finalComment,
              "utf8",
              (err) => {
                if (err) console.log(err.message);
              }
            );
            console.log("Finished writing comments to simple file.");
          })
          .catch(() => res.status(404).send("Bad id"))
          .finally(() => {
            res.status(200).end();
          });
      } else res.end();
    });
});

app.get("/vod/jsonchat/:id", (req, res) => {
  electron.dialog
    .showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: electron.app.getPath("downloads"),
    })
    .then((value) => {
      if (!value.canceled) {
        getCommentsJson(req.params.id, 0, 10000000)
          .then((comments) => {
            fse.writeFileSync(
              `${value.filePaths[0]}\\commentsFor${req.params.id}.json`,
              JSON.stringify(comments),
              "utf8",
              (err) => {
                if (err) console.log(err.message);
              }
            );
            console.log("Finished writing comments to JSON file.");
          })
          .catch(() => res.status(404).send("Bad id"))
          .finally(() => {
            res.status(200).end();
          });
      } else res.end();
    });
});
app.get("/vod/highlights/:id", async (req, res) => {
  try {
    res.send(await getChatSpeed(req.params.id));
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .send("Specified id is not applicable for getting highlights");
  }
});
app.listen(PORT, () => console.log("Server is ready on " + PORT));
