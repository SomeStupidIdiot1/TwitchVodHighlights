# Twitch Vod Scraper

This is used to get information about a twitch vod.

It includes getting four things: **Metadata**, **The Vod**, **The Chat**, **Potential Highlights**

## Downloading

Only supported on windows currently, go to the releases tab and download the executable.

## What it does

The metadata includes everything relating to the vod, such as the channel info, length of the vod, etc.

Downloading parts of the vod is possible, being able to download many bits of the vod simultaneously.

The chat can also be downloaded. It supports downloading both the JSON format that includes all the metadata, and a simple version that only includes the commenter's name, time of the comment, and the comment's message.

The potential highlights is gotten by calculating how the messages per second, and giving a list of times that have a high chat speed.

## Technologies used

ReactJS, electronJS, expressJS

## Development

Fork/clone the project. Run `npm install` in the outer most directory, inside of `backend` and inside of `frontend`.

To run the project, call `npm start` inside of `frontend`, then call `npm run dev` in `backend`. Any updates in backend will require the call to `npm run dev` again to access the updated code.

To build the project, call `npm run build` in `frontend`, then move the build directory into `backend`. To see a production version, run `npm start` in backend. To distribute it, run `npm run dist` in `backend`.
