const express = require("express");
const bodyParesr = require("body-parser");
const server = express();
// const path = require("path");

server.use(bodyParesr.json());
server.get("/", (req, res) => {
  res.send("<h1>Hello Express.js Server!</h1>");
});

const auth = require("./apis/user/auth.js");
const msg = require("./apis/msg/msg.js");
const songs = require("./apis/song/song.js");
const remixSongs = require("./apis/song/remix_song.js");
const authors = require("./apis/authors/authors.js");
const upload = require("./apis/audio_files/upload.js");
const uploadRemix = require("./apis/audio_files/upload_remix.js");
const download = require("./apis/audio_files/download.js");
const playlist = require("./apis/playlist/playlist.js");
const deviceInfo = require("./apis/device_info/device_info.js");
const test = require("./html/test.js");
server.use("/user", auth);

server.use("/avatars", express.static("avatars"));
server.use("/song_avatar", express.static("song_avatars"));
server.use("/author_avatar", express.static("authors_avatar"));
server.use("/song_remix_avatars", express.static("song_remix_avatars"));

server.use("/msg", msg);
server.use("/songs", songs);
server.use("/remix_songs", remixSongs);
server.use("/upload_song", upload);
server.use("/upload_remix_song", uploadRemix);
server.use("/download_song", download);
server.use("/test", test);
server.use("/authors", authors);
server.use("/playlist", playlist);
server.use("/device_info", deviceInfo);



server.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

// server.use(express.static(path.join(__dirname, 'html')));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
