const express = require("express");
const router = express.Router();
const fs = require("fs");

const response = require("../../controllers/response/response.js");
const songsDB = require("../../controllers/DB/song_db.js");
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");

const jwtv2 = new JWTV2();

router.all("/", (req, res) => {
  const respond = response.customJSONResponse(
    200,
    "Huh?",
    null,
    "What are you doing here? >:("
  );
  res.end(respond);
});

router.get("/get_all_songs", async (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer")) {
    response.setInvalidTokenResponse(res);
  } else {
    let token = authorization.split(" ")[1];
    const results = await songsDB.getAllSongs(token);
    if (results.status) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          200,
          "Success",
          null,
          "Songs fetched successfully",
          results.data
        )
      );
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          401,
          "Error",
          results.errorCode,
          results.message,
          results.data
        )
      );
    }
  }
});

router.get("/load_song", async (req, res) => {
  const authorization = req.headers.authorization;
  const songID = req.query.id;
  if (!songID) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
    return;
  }
  
  if (!authorization || !authorization.startsWith("Bearer")) {
    response.setInvalidTokenResponse(res);
  } else {
    let token = authorization.split(" ")[1];
    const results = await songsDB.getSongDetails(token, songID);
    console.log(results.data);
    if (results.status) {
      const filePath = `./songs/${results.data["song_path"]}`;
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).end();
          return;
        }

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", data.length);

        res.send(data);
      });
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          401,
          "Error",
          results.errorCode,
          results.message,
          results.data
        )
      );
    }
  }
});

router.get("/search_song", async (req, res) => {
  const authorization = req.headers.authorization;
  const songText = req.query.songtext;
  if (!songText) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
    return;
  }

  if (!authorization || !authorization.startsWith("Bearer")) {
    response.setInvalidTokenResponse(res);
  } else {
    let token = authorization.split(" ")[1];
    const results = await songsDB.getSongs(token, songText);
    if (results.status) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          200,
          "Success",
          null,
          "Songs fetched successfully",
          results.data
        )
      );
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          401,
          "Error",
          results.errorCode,
          results.message,
          results.data
        )
      );
    }
  }
});

router.get("/get_song", async (req, res) => {
  const authorization = req.headers.authorization;
  const authorID = req.query.authorid;
  if (!authorID) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
    return;
  }

  if (!authorization || !authorization.startsWith("Bearer")) {
    response.setInvalidTokenResponse(res);
  } else {
    let token = authorization.split(" ")[1];
    const results = await songsDB.getAuthorSongs(token, authorID);
    if (results.status) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          200,
          "Success",
          null,
          "Songs fetched successfully",
          results.data
        )
      );
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        response.customJSONResponse(
          401,
          "Error",
          results.errorCode,
          results.message,
          results.data
        )
      );
    }
  }
});

module.exports = router;
