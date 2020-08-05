import axios from "axios";

const baseUrl = "http://localhost:8080";
export const getVodInfo = async (id) => {
  try {
    return (await axios.get(`${baseUrl}/vod/getvodinfo/${id}`)).data;
  } catch (err) {
    throw new Error(`Could not get twitch.tv/videos/${id}`);
  }
};
