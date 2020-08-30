// For getting info from twitch api
const axios = require("axios");
// For making a temporary directory
const tmp = require("tmp");
// For executing a ffmpeg command
const { exec } = require("child_process");
// For making a new video file
const fse = require("fs-extra");
// Used to access twitch api
const config = { headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" } };

// This gets a token and a signature to get access to a file containing a list of playlists
const getAccessToken = async (videoId) => {
  const ACCESS_TOKEN_URL = `https://api.twitch.tv/api/vods/${videoId}/access_token`;
  try {
    const token = await axios.get(ACCESS_TOKEN_URL, config);
    return token;
  } catch (err) {
    throw new Error("Failed to get token");
  }
};
// For getting a list of playlists
const getPlaylists = async (videoId) => {
  const token = await getAccessToken(videoId);
  const ALL_PLAYLISTS_URL = `https://usher.ttvnw.net/vod/${videoId}.m3u8?nauthsig=${token.data.sig}&nauth=${token.data.token}&allow_source=true&player=twitchweb&allow_spectre=true&allow_audio_only=true`;

  const playlists = {};
  try {
    (await axios.get(ALL_PLAYLISTS_URL, config)).data
      .split("\n")
      .filter(
        (info) => info.startsWith("#EXT-X-MEDIA") || info.startsWith("https")
      )
      .forEach((info, index, array) => {
        if (info.startsWith("#EXT-X-MEDIA")) {
          const firstIndex = info.indexOf("NAME") + 6;
          // eslint-disable-next-line
          playlists[info.substring(firstIndex, info.indexOf('"', firstIndex))] =
            array[index + 1];
        }
      });
  } catch (err) {
    throw new Error("Failed to get playlists. Video id is probably bad.");
  }
  return playlists;
};
// For getting a specific playlist from the list of playlists by specifying the quality of the video
const getPlaylist = async (videoId, quality = "default") => {
  const playlists = await getPlaylists(videoId);
  const qualities = Object.keys(playlists);
  let selectedQuality = "";
  if (quality === "default") selectedQuality = qualities[0];
  else {
    if (qualities.includes(quality)) selectedQuality = quality;
    else {
      console.warn(
        `The quality ${quality} does not exist. Using default quality.`
      );
      selectedQuality = qualities[0];
    }
  }
  return playlists[selectedQuality];
};
// For getting a video clip
const getVideoClip = async (url, newFilePath) => {
  try {
    const res = await axios.get(url, { responseType: "stream" });
    const stream = fse.createWriteStream(newFilePath);
    res.data.pipe(fse.createWriteStream(newFilePath));
    console.log("Downloading video clip from " + url);
    return new Promise((resolve, reject) => {
      res.data.on("end", () => {
        console.log("Completed downloading " + url);
        stream.close();
        resolve("Completed downloading " + url);
      });
      res.data.on("error", () => {
        reject(`Failed to download. url: ${url}. file path: ${newFilePath}`);
      });
    });
  } catch (err) {
    throw new Error("Could not download " + url);
  }
};
// For combining a bunch of video clips and cropping it to specified times
const combineVideoClips = (
  path,
  startCropTime,
  startFileNum,
  lastFileNum,
  outputName,
  length
) => {
  let command = `ffmpeg -y -ss ${startCropTime} -i "concat:`;
  for (let i = startFileNum; i <= lastFileNum; i++) {
    if (i !== lastFileNum) command += `${path}\\${i}.ts|`;
    else command += `${path}\\${i}.ts"`;
  }
  command += ` -analyzeduration 2000000000 -probesize 2000000000 -c copy -t ${length} "${outputName}"`;
  console.log("Running ffmpeg command: " + command);
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
// Getting the info inside a playlist such as the name of the file and the length of the file
const getPlaylistInfo = async (startTime, endTime, playlistUrl) => {
  // If specified times are bad
  if (startTime > endTime)
    throw new Error("Start time shouldn't be greater than end time");
  console.log("Getting playlist info");

  // Getting all the info from the playlist (unchanged)
  let data;
  try {
    data = (await axios.get(playlistUrl)).data.split("\n");
  } catch (e) {
    throw new Error("Failed to get playlist info");
  }
  console.log("Successfully gotten playlist info");

  // From the info gotten from the playlist url, get the name of each video clip,
  // length of it, and also the specific number each video clip name has
  let info = [];
  let actualTotalLength = 0;
  let fileIndex = 0;
  data.forEach((item, index) => {
    if (item.startsWith("#EXTINF:")) {
      const partLength = parseFloat(
        item.substring(item.indexOf(":") + 1, item.length - 1)
      );
      const name = data[index + 1];
      actualTotalLength += partLength;
      info.push({ partLength, name, fileIndex });
      fileIndex++;
    }
  });
  if (startTime > actualTotalLength)
    throw new Error("Start time is greater than the length of the video");

  // Simplifying the list of all video clips by specifying where the start video clip should be
  let tempTotalLength = 0;
  let startIndex = 0;
  let startCropTime = startTime;
  for (let i = 0; i < info.length; i++) {
    const partLength = info[i].partLength;
    if (tempTotalLength + partLength <= startCropTime)
      tempTotalLength += partLength;
    else {
      startCropTime -= tempTotalLength;
      startIndex = i;
      break;
    }
  }

  // Simplifying the list of video clips by specifying where the last video clip should be
  tempTotalLength = 0;
  let endIndex = info.length;
  for (let i = 0; i < info.length; i++) {
    const partLength = info[i].partLength;
    if (tempTotalLength >= endTime) {
      endIndex = i;
      break;
    }
    tempTotalLength += partLength;
  }
  // What the length of the final video should be
  const length =
    endTime > actualTotalLength
      ? actualTotalLength - startTime
      : endTime - startTime;
  info = info.slice(startIndex, endIndex);

  return { info, startCropTime, length };
};
// Getting all the qualities of the video
const getQualities = async (videoId) => {
  const playlists = await getPlaylists(videoId);
  return Object.keys(playlists);
};
// Where everything comes together and a final video is produced
const getVideo = async (
  videoId,
  startTime = 0,
  endTime = 100000000,
  quality = "default",
  outputPath,
  fileName = null
) => {
  if (endTime <= startTime) {
    console.log("End time is smaller or equal to the start time.");
    return;
  }
  // The specific playlist based by the quality is gotten here
  const playlistUrl = await getPlaylist(videoId, quality);

  // Getting the base url of the specific playlist url (since videos are gotten by concatenating to that)
  const indexOfSlash = playlistUrl.lastIndexOf("/");
  const baseUrl = playlistUrl.substring(0, indexOfSlash);

  // Getting necessary info of this specific playlist
  try {
    var { info, startCropTime, length } = await getPlaylistInfo(
      startTime,
      endTime,
      playlistUrl
    );
  } catch (err) {
    console.log(err.message);
    return;
  }
  // Creating a temp directory
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  const path = tmpobj.name;
  console.log("Creating temp folder at " + path);

  // Getting all the video clips
  let promises = [];
  for (let item of info) {
    const { name, fileIndex } = item;
    promises.push(
      getVideoClip(baseUrl + `/${name}`, `${path}/${fileIndex}.ts`)
    );
  }
  // Waiting for all the video clips to finish downloading
  await Promise.all(promises);

  // Getting the final video file name
  const videoFileName = fileName
    ? `${outputPath}\\${fileName}`
    : `${outputPath}\\videoId=${videoId}startTime=${startTime}endTime=${endTime}quality=${quality}.ts`;
  // Combining all the video file clips
  console.log("Combining video clips...");
  try {
    await combineVideoClips(
      path,
      startCropTime,
      info[0].fileIndex,
      info[info.length - 1].fileIndex,
      videoFileName,
      length
    );
    console.log("Succesfully combined video clips.");
    console.log(`The video file called ${videoFileName} has been created.`);
  } catch (err) {
    console.log("Failed to combine video clips.\n");
    console.log(err.message);
  }
  console.log("Removing temp folder...");
  tmpobj.removeCallback();
  console.log("Succesfully removed temp folder.");
  return videoFileName;
};
module.exports = { getQualities, getVideo };
