const express = require("express");
const router = express.Router();
const response = require("../../controllers/response/response.js");
const playlistDB = require("../../controllers/DB/playlist_db.js");

router.all("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  const respond = response.customJSONResponse(
    200,
    "Huh?",
    null,
    "What are you doing here? >:("
  );
  res.end(respond);
});

router.get("/get_playlists", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      try {
        // Get playlist data from database
        const results = await playlistDB.get_playlists();
        if (results.status) {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              Code: 200,
              Status: "Success",
              errorCode: results.errorCode,
              Message: results.message,
              Data: results.data,
            })
          );
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 400,
              Status: "Error",
              errorCode: results.errorCode,
              Message: results.message,
            })
          );
        }
      } catch (error) {
        console.log("Setting header 401 in auth.sj 33");
        res.writeHead(401, { "Content-Type": "application/json" });
        if (error.name === "TokenExpiredError") {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772001x",
              "Invalid request",
              error
            )
          );
        } else {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772009x",
              "Invalid request",
              error
            )
          );
        }
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

router.get("/get_playlist_song", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const playlistID = req.query.id;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      try {
        // Get playlist data from database
        const results = await playlistDB.get_playlist_song(playlistID);
        if (results.status) {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              Code: 200,
              Status: "Success",
              errorCode: results.errorCode,
              Message: results.message,
              data: results.data,
            })
          );
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 400,
              Status: "Error",
              errorCode: results.errorCode,
              Message: results.message,
            })
          );
        }
      } catch (error) {
        console.log("Setting header 401 in auth.sj 33");
        res.writeHead(401, { "Content-Type": "application/json" });
        if (error.name === "TokenExpiredError") {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772001x",
              "Invalid request",
              error
            )
          );
        } else {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772009x",
              "Invalid request",
              error
            )
          );
        }
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

module.exports = router;
