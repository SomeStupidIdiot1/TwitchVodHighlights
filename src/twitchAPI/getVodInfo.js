import axios from "axios";
const config = { headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" } };

export const getVodInfo = async (id) => {
  const url = `https://api.twitch.tv/v5/videos/${id}`;
  try {
    const { data } = await axios.get(url, config);
    return data;
  } catch (e) {
    throw new BadIdError(`Could not get the vod at twitch.tv/videos/${id}`, id);
  }
};
export class BadIdError extends Error {
  constructor(message, id) {
    super(message);
    this.id = id;
  }
}
