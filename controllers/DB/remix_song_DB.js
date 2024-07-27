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
  })
  .promise();

async function getAllRemix(accessToken, songID) {
  const userInfo = await jwtv2.verify(accessToken, { verify: {} });
  try {
    if (userInfo.status) {
      const [results] = await pool.query(
        "SELECT * FROM remix_song WHERE song_id = ?",
        [songID]
      );
      if(results == 0) {
        return {
          status: false,
          errorCode: "772012x",
          message: "No results were found",
          data: null,
        };
      } else {
        return {
          status: true,
          error: userInfo.errorCode,
          message: userInfo.message,
          data: results,
        };
      }
    } else {
      return {
        status: false,
        errorCode: userInfo.errorCode,
        message: userInfo.message,
        data: null,
      };
    }
  } catch (error) {
    return {
      status: false,
      errorCode: userInfo.errorCode,
      message: userInfo.message,
      data: null,
    };
  }
}

async function getRemixSongs(accessToken, songText) {
  const userInfo = await jwtv2.verify(accessToken, { verify: {} });
  try {
    if (userInfo.status) {
      var cmd =
        "SELECT * FROM remixview WHERE remix_name LIKE CONCAT('%', ?, '%')";
        console.log(`The song text is: ${songText}`);
      if (songText.length <= 2) {
        cmd = "SELECT * FROM remixview WHERE remix_name LIKE CONCAT(?, '%')";
      }
      const [results] = await pool.query(cmd, [songText]);

      if (results.length == 0) {
        return {
          status: false,
          errorCode: "772012x",
          message: "No results were found",
          data: null,
        };
      } else {
        return {
          status: true,
          errorCode: "",
          message: "Success",
          data: results,
        };
      }
    } else {
      return {
        status: false,
        errorCode: userInfo.errorCode,
        message: userInfo.message,
        data: null,
      };
    }
  } catch (error) {
    console.log(error)
    return {
      status: false,
      errorCode: userInfo.errorCode,
      message: userInfo.message,
      data: null,
    };
  }
}


module.exports = { getAllRemix, getRemixSongs };
