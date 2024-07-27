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

app.use("/.netlify/functions/app/avatars", express.static("avatars"));
app.use("/.netlify/functions/app/song_avatar", express.static("song_avatars"));
app.use("/.netlify/functions/app/author_avatar", express.static("authors_avatar"));
app.use("/.netlify/functions/app/song_remix_avatars", express.static("song_remix_avatars"));

app.use("/.netlify/functions/app/msg", msg);
app.use("/.netlify/functions/app/songs", songs);
app.use("/.netlify/functions/app/remix_songs", remixSongs);
app.use("/.netlify/functions/app/upload_song", upload);
app.use("/.netlify/functions/app/upload_remix_song", uploadRemix);
app.use("/.netlify/functions/app/download_song", download);
app.use("/.netlify/functions/app/test", test);
app.use("/.netlify/functions/app/authors", authors);
app.use("/.netlify/functions/app/playlist", playlist);
app.use("/.netlify/functions/app/device_info", deviceInfo);



app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});




router.get("/", (req, res) => {
    res.send("App is running running a lot..");
});

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);