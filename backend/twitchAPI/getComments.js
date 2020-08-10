const axios = require("axios");
const getVodInfo = require("./getVodInfo");
const config = { headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" } };

// This is used to get the first few comments based on time
const getFirstComments = async (videoId, startInSeconds) => {
  const url = `https://api.twitch.tv/v5/videos/${videoId}/comments?content_offset_seconds=${startInSeconds}`;

  const { data } = await axios.get(url, config);
  console.log(
    `loaded chat from ${data.comments[0].content_offset_seconds}s to ${
      data.comments[data.comments.length - 1].content_offset_seconds
    }s`
  );
  return data;
};
// This is used to get the next comments based on the link from the previous comment
const getNext = async (videoId, cursor) => {
  const url = `https://api.twitch.tv/v5/videos/${videoId}/comments?cursor=${cursor}`;
  try {
    const { data } = await axios.get(url, config);
    console.log(
      `loaded chat from ${data.comments[0].content_offset_seconds}s to ${
        data.comments[data.comments.length - 1].content_offset_seconds
      }s`
    );
    return data;
  } catch (err) {
    throw new Error("Bad Id");
  }
};
const getCommentsJsonHelper = async (videoId, startInSeconds, endInSeconds) => {
  const delta = endInSeconds - startInSeconds;
  if (delta < 1000) {
    let comments = [];
    let data;
    try {
      data = await getFirstComments(videoId, startInSeconds);
      comments = comments.concat(data.comments);
    } catch (err) {
      throw new Error("ERROR: Failed to get the first few comments");
    }
    if (!comments.length || endInSeconds < startInSeconds) {
      console.log("WARNING: Start time has no comments");
      return [];
    }

    while (
      comments[comments.length - 1].content_offset_seconds < endInSeconds &&
      data._next
    ) {
      try {
        data = await getNext(videoId, data._next);
      } catch (err) {
        throw new Error("ERROR: Failed to get the next comments");
      }
      comments = comments.concat(data.comments);
    }
    return comments;
  } else {
    const comments1 = getCommentsJsonHelper(
      videoId,
      startInSeconds,
      startInSeconds + delta / 2
    );
    const comments2 = getCommentsJsonHelper(
      videoId,
      startInSeconds + delta / 2,
      endInSeconds
    );
    return Promise.all([comments1, comments2]).then((comments) => {
      if (comments[0].length === 0 || comments[1].length === 0)
        return comments[0].concat(comments[1]);
      const earliest = comments[1][0].content_offset_seconds;
      let currIndex = comments[0].length - 1;
      while (
        currIndex >= 0 &&
        comments[0][currIndex].content_offset_seconds >= earliest
      ) {
        currIndex--;
      }
      return comments[0].slice(0, currIndex + 1).concat(comments[1]);
    });
  }
};
const getCommentsJson = async (
  videoId,
  startInSeconds = 0,
  endInSeconds = 1000000000
) => {
  const length = (await getVodInfo(videoId)).length;
  const comments = await getCommentsJsonHelper(
    videoId,
    startInSeconds,
    endInSeconds > length ? length : endInSeconds
  );
  console.log("Finished loading comments JSON");
  return comments;
};
// Only includes display name, the message, and the time
const getSimpleComments = async (
  videoId,
  startInSeconds = 0,
  endInSeconds = 1000000000
) => {
  const comments = await getCommentsJson(videoId, startInSeconds, endInSeconds);
  return comments.map((item) => ({
    name: item.commenter.display_name,
    message: item.message.body.trim(),
    offset_seconds: item.content_offset_seconds,
  }));
};
module.exports = { getCommentsJson, getSimpleComments };
