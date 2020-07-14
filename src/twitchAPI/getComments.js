import axios from "axios";
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
  const { data } = await axios.get(url, config);
  console.log(
    `loaded chat from ${data.comments[0].content_offset_seconds}s to ${
      data.comments[data.comments.length - 1].content_offset_seconds
    }s`
  );
  return data;
};
// This combines a lot of comments together based on time
export const getCommentsJson = async (
  videoId,
  startInSeconds = 0,
  endInSeconds = 1000000000
) => {
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
};
// Only includes display name, the message, and the time
export const getSimpleComments = async (
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
