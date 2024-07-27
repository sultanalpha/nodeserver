const express = require("express");
const router = express.Router();

const response = require("../../controllers/response/response.js");
const remixSongsDB = require("../../controllers/DB/remix_song_DB.js");

router.all("/", (req, res) => {
  const respond = response.customJSONResponse(
    200,
    "Huh?",
    null,
    "What are you doing here? >:("
  );
  res.end(respond);
});

router.get("/get_all_remix", async (req, res) => {
  const authorization = req.headers.authorization;
  const songID = req.query.songid;
  if (!songID) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
    return;
  }

  if (!authorization || !authorization.startsWith("Bearer")) {
    response.setInvalidTokenResponse(res);
  } else {
    let token = authorization.split(" ")[1];
    const results = await remixSongsDB.getAllRemix(token, songID);
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

router.get("/search_remix_song", async (req, res) => {
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
    const results = await remixSongsDB.getRemixSongs(token, songText);
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
