const express = require("express");
const router = express.Router();
const downloadDB = require("../../controllers/DB/audio_files/download_db.js");
const response = require("../../controllers/response/response.js");
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

router.get("/", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const songID = req.query.songid;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else if (!songID) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        Code: 400,
        Status: "Error",
        errorCode: "772010x",
        Message: "Song id cant be empty!",
      })
    );
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      const userInfo = await jwtv2.verify(token, { verify: {} });
      if (userInfo.status) {
        const result = await downloadDB.getSongDetails(songID);
        if (result.status) {
          const [queryResult] = result.data;
          const file = `songs/${queryResult.song_path}`;
          res.download(file);
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 400,
              Status: "Error",
              errorCode: result.errorCode,
              Message: result.message,
            })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            Code: 400,
            Status: "Error",
            errorCode: userInfo.errorCode,
            Message: userInfo.message,
          })
        );
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

router.get("/get_avatar", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const avatarID = req.query.avatarid;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else if (!avatarID) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        Code: 400,
        Status: "Error",
        errorCode: "772010x",
        Message: "avatar id cant be empty!",
      })
    );
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      const userInfo = await jwtv2.verify(token, { verify: {} });
      if (userInfo.status) {
        const result = await downloadDB.getSongDetails(avatarID);
        if (result.status) {
          const [queryResult] = result.data;
          const file = `song_avatars/${queryResult.song_avatar}`;
          res.download(file);
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 400,
              Status: "Error",
              errorCode: result.errorCode,
              Message: result.message,
            })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            Code: 400,
            Status: "Error",
            errorCode: userInfo.errorCode,
            Message: userInfo.message,
          })
        );
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

router.get("/get_author_avatar", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const authorID = req.query.authorid;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else if (!authorID) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        Code: 400,
        Status: "Error",
        errorCode: "772010x",
        Message: "author id cant be empty!",
      })
    );
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      const userInfo = await jwtv2.verify(token, { verify: {} });
      if (userInfo.status) {
        const result = await downloadDB.getSongDetails(authorID);
        if (result.status) {
          const [queryResult] = result.data;
          const file = `authors_avatar/${queryResult.song_avatar}`;
          res.download(file);
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 400,
              Status: "Error",
              errorCode: result.errorCode,
              Message: result.message,
            })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            Code: 400,
            Status: "Error",
            errorCode: userInfo.errorCode,
            Message: userInfo.message,
          })
        );
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

module.exports = router;
