const express = require("express");
const router = express.Router();

const response = require("../../controllers/response/response.js");
const msgDB = require("../../controllers/DB/msg_db.js");

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

router.post("/create_room", async (req, res) => {
  const accessToken = req.headers.authorization;
  const [bearer, token] = accessToken.split(" ");
  const { secondUserID } = req.body;
  const result = await msgDB.createRoom(token, secondUserID);
  console.log(result);
  if (result.status) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      response.customJSONResponse(200, "Success", null, result.message, null)
    );
  } else {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      response.customJSONResponse(
        401,
        "Error",
        result.errorCode,
        result.message,
        result.data
      )
    );
  }
});

router.post("/send_msg", async (req, res) => {
  const accessToken = req.headers.authorization;
  const { msgText, roomID } = req.body;
  const result = await msgDB.sendMsg(accessToken, msgText, roomID);
  if (result.status) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      response.customJSONResponse(200, "Success", null, result.message, null)
    );
  } else {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      response.customJSONResponse(
        401,
        "Error",
        result.errorCode,
        result.message,
        result.data
      )
    );
  }
});

router.get("/get_msgs", async (req, res) => {
  const accessToken = req.headers.authorization;
  const roomID = req.query.room_id;
  const result = await msgDB.getMessages(accessToken, roomID);
  if (result.status) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      response.customJSONResponse(200, "Success", null, result.message, result.data)
    );
  } else {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(
      response.customJSONResponse(
        401,
        "Error",
        result.errorCode,
        result.message,
        result.data
      )
    );
  }
})

module.exports = router;
