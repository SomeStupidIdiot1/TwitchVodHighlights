import axios from "axios";

export const getVodInfo = async (id) => {
  try {
    return (await axios.get(`/vod/vodinfo/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get twitch.tv/videos/${id}`);
  }
};

export const getQualities = async (id) => {
  try {
    return (await axios.get(`/vod/vodqualities/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get twitch.tv/videos/${id}`);
  }
};
export const getVods = async (data) => {
  // data: {quality: ???, id: ??? clips: [{startTime, endTime, filename}]}
  try {
    await axios.post(`/vod/voddownload`, data);
  } catch (err) {
    throw err;
  }
};
export const downloadMetadata = async (metadata) => {
  try {
    if (metadata.length) await axios.post("/jsondownload", metadata);
  } catch (err) {
    throw new Error(`Could not download metadata`);
  }
};
export const downloadSimpleChat = async (id) => {
  try {
    return (await axios.get(`/vod/simplechat/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get the chat from twitch.tv/videos/${id}`);
  }

}
export const downloadChatJson = async (id) => {
  try {
    return (await axios.get(`/vod/jsonchat/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get the chat from twitch.tv/videos/${id}`);
  }

}
export const getHighlights = async (id) => {
  try {
    return (await axios.get(`/vod/highlights/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get highlights from twitch.tv/videos/${id}.`);
  }

}