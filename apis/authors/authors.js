const express = require("express");
const router = express.Router();
const authorDB = require("../../controllers/DB/authors_db.js");
const response = require("../../controllers/response/response.js");
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

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

router.get("/get_authors", async (req, res) => {
  let authorName = req.query.author;
  const authorizationHeader = req.headers.authorization;

  if (!authorName) {
    authorName = "";
    // res.writeHead(400, { "Content-Type": "application/json" });
    // res.end(
    //   JSON.stringify({
    //     Code: 400,
    //     Status: "Error",
    //     errorCode: "772010x",
    //     Message: "Some values are missing",
    //   })
    // );
  }

  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      const userInfo = await jwtv2.verify(token, { verify: {} });
      if (userInfo.status) {
        const userDetails = userInfo.data;
        const results = await authorDB.getAuthors(authorName, userDetails['userDetails']['users_id']);
        if (results.status) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 200,
              Status: "Success",
              ErrorCode: results.errorCode,
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
              ErrorCode: results.errorCode,
              Message: results.message,
            })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            Code: 400,
            Status: "Error",
            ErrorCode: userInfo.errorCode,
            Message: userInfo.message,
          })
        );
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

router.get("/get_author", async (req, res) => {
  let songid = req.query.songid;
  const authorizationHeader = req.headers.authorization;

  if (!songid) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        Code: 400,
        Status: "Error",
        ErrorCode: "772010x",
        Message: "Some values are missing",
      })
    );
  }

  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      const userInfo = await jwtv2.verify(token, { verify: {} });
      if (userInfo.status) {
        const results = await authorDB.searchAuthor(songid);
        if (results.status) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              Code: 200,
              Status: "Success",
              ErrorCode: results.errorCode,
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
              ErrorCode: results.errorCode,
              Message: results.message,
            })
          );
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            Code: 400,
            Status: "Error",
            ErrorCode: userInfo.errorCode,
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
