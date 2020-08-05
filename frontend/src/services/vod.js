import axios from "axios";

// Only for development
const baseUrl = "http://localhost:8080";

export const getVodInfo = async (id) => {
  try {
    return (await axios.get(`${baseUrl}/vod/vodinfo/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get twitch.tv/videos/${id}`);
  }
};

export const getQualities = async (id) => {
  try {
    return (await axios.get(`${baseUrl}/vod/vodqualities/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get twitch.tv/videos/${id}`);
  }
};
