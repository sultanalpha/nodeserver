const mysql = require("mysql2");
require("dotenv").config();
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

var pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  })
  .promise();

async function createRoom(accessToken, secondUserID) {
  try {
    const userInfo = (await jwtv2.verify(accessToken, { verify: {}})).data;

    const [checkRoom] = await pool.query(
      "SELECT * FROM rooms WHERE user1_id = ? AND user2_id = ?",
      [userInfo["userDetails"]["users_id"], secondUserID]
    );

    if (checkRoom.length === 0) {
      const [results] = await pool.query(
        "INSERT INTO rooms (room_id, user1_id, user2_id) VALUES (?, ?, ?)",
        [null, userInfo["userDetails"]["users_id"], secondUserID]
      );
      return {
        status: true,
        message: "Room create successfully",
        data: results,
      };
    } else {
      return {
        status: false,
        errorCode: "772072x",
        message: "Room is alr created",
        data: null,
      };
    }
  } catch (error) {
    return {
      status: false,
      errorCode: "772073x",
      message: "Somthing went wrong!",
      data: error,
    };
  }
}

async function sendMsg(accessToken, msgText, roomID) {
  try {
    const userInfo = (await jwtv2.verify(accessToken, { verify: {}})).data;
    const [checkuser] = await pool.query('SELECT * FROM rooms WHERE room_id = ? AND (user1_id = ? OR user2_id = ?);',
    [roomID, userInfo['userDetails']['users_id'], userInfo['userDetails']['users_id']]);
    if(checkuser.length === 0) {
      return {
        status: false,
        errorCode: "772072x",
        message: "Invalid room id or user",
        data: null,
      };
    } else {
      const [sendMessage] = await pool.query(
        "INSERT INTO room_messages (message_id, message_text, room_id, user_id, created) VALUES (?, ?, ?, ?, ?)",
        [null, msgText, roomID, userInfo["userDetails"]["users_id"], null]
      );
      return {
        status: true,
        message: "Message sent successfully",
        data: sendMessage,
      };
    }
  } catch (error) {
    console.log(error)
    return {
      status: false,
      errorCode: "772073x",
      message: "Somthing went wrong!",
      data: error,
    };
  }
}

async function getMessages(accessToken, roomID) {
  try {
    const userInfo = (await jwtv2.verify(accessToken, { verify: {}})).data;
    const [checkuser] = await pool.query('SELECT * FROM rooms WHERE room_id = ? AND (user1_id = ? OR user2_id = ?);',
    [roomID, userInfo['userDetails']['users_id'], userInfo['userDetails']['users_id']]);
    if(checkuser.length === 0) {
      return {
        status: false,
        errorCode: "772072x",
        message: "Invalid room id or user",
        data: null,
      };
    } else {
      const [sendMessage] = await pool.query(
        `SELECT * FROM room_messages WHERE room_id = ? ORDER BY message_id DESC LIMIT ${process.env.MSG_LIMIT}`,
        [roomID]
      );
      return {
        status: true,
        message: "Messages recived successfully",
        data: sendMessage,
      };
    }

  } catch (error) {
    return {
      status: false,
      errorCode: "772073x",
      message: "Somthing went wrong!",
      data: error,
    };
  }
}

module.exports = { createRoom, sendMsg, getMessages };
