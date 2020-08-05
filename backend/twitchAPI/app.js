const comments = require("./getComments");
const highlights = require("./getHighlights");

// This is the id found in the url of every vod
// This id has to exist (vods expire after some time)
const VIDEO_ID = 651276018;

const START_IN_SECONDS = 0;
const END_IN_SECONDS = 1000;

// Downloading a video
// const { getVideo, getQualities } = require("./getVod");

// const VIDEO_ID = 660481648;
// getQualities(VIDEO_ID)
//   .then((qualities) => console.log(qualities))
//   .catch((err) => console.log(err.message));
// getVideo(
//   VIDEO_ID,
//   (startTime = 39600),
//   (endTime = 39605),
//   (quality = "default"),
//   (fileName = "ouput.mp4")
// ).catch((err) => console.log(err.message));

// This OVERWRITES or WRITES to a JSON file
// comments
//   .getSimpleComments(
//     VIDEO_ID,
//     (startInSeconds = START_IN_SECONDS),
//     (endInSeconds = END_IN_SECONDS)
//   )
//   .then((comments) => {
// fs.writeFile("comments.json", JSON.stringify(comments), "utf8", (err) => {
//   if (err) console.log(err.message);
// });
//   })
//   .catch((err) =>
//     console.log(`${err.message}. Is the vod id and start time valid?`)
//   );

// If you already have an existing JSON file
// highlights.getChatSpeed(require("./comments.json"), (timeInterval = 4));
