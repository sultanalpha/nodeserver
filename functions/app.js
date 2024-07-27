const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
const bodyParesr = require("body-parser");

app.use(bodyParesr.json());
app.get("/", (req, res) => {
  res.send("<h1>Hello Express.js Server!</h1>");
});

const auth = require("../apis/user/auth.js");
const msg = require("../apis/msg/msg.js");
const songs = require("../apis/song/song.js");
const remixSongs = require("../apis/song/remix_song.js");
const authors = require("../apis/authors/authors.js");
const upload = require("../apis/audio_files/upload.js");
const uploadRemix = require("../apis/audio_files/upload_remix.js");
const download = require("../apis/audio_files/download.js");
const playlist = require("../apis/playlist/playlist.js");
const deviceInfo = require("../apis/device_info/device_info.js");
const test = require("../html/test.js");
app.use("/.netlify/functions/app/user", auth);

app.use("/avatars", express.static("avatars"));
app.use("/song_avatar", express.static("song_avatars"));
app.use("/author_avatar", express.static("authors_avatar"));
app.use("/song_remix_avatars", express.static("song_remix_avatars"));

app.use("/msg", msg);
app.use("/songs", songs);
app.use("/remix_songs", remixSongs);
app.use("/upload_song", upload);
app.use("/upload_remix_song", uploadRemix);
app.use("/download_song", download);
app.use("/test", test);
app.use("/authors", authors);
app.use("/playlist", playlist);
app.use("/device_info", deviceInfo);



app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});




router.get("/", (req, res) => {
    res.send("App is running running a lot..");
});

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);