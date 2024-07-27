const mysql = require("mysql2");
require("dotenv").config();
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

var pool = mysql
  .createPool({
    host: 'sql.freedb.tech',
    user: 'freedb_sultanking',
    password: '%E!9Sq5BpgXpVyE',
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  })
  .promise();

async function getSongDetails(accessToken, songID) {
  const userInfo = await jwtv2.verify(accessToken, { verify: {} });
  try {
    if (userInfo.status) {
      const [results] = await pool.query(
        "SELECT * FROM songs WHERE song_id = ?",
        [songID]
      );
      return {
        status: true,
        error: userInfo.errorCode,
        message: userInfo.message,
        data: results[0],
      };
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
async function getAllSongs(accessToken) {
  const userInfo = await jwtv2.verify(accessToken, { verify: {} });
  try {
    if (userInfo.status) {
      const results = await pool.query("SELECT * FROM songview");
      return {
        status: true,
        error: userInfo.errorCode,
        message: userInfo.message,
        data: results[0],
      };
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

async function getSongs(accessToken, songText) {
  const userInfo = await jwtv2.verify(accessToken, { verify: {} });
  try {
    if (userInfo.status) {
      var cmd =
        "SELECT * FROM songview WHERE song_name LIKE CONCAT('%', ?, '%')";
        console.log(`The song text is: ${songText}`);
      if (songText.length <= 2) {
        cmd = "SELECT * FROM songview WHERE song_name LIKE CONCAT(?, '%')";
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

async function getAuthorSongs(accessToken, authorID) {
  const userInfo = await jwtv2.verify(accessToken, { verify: {} });
  try {
    if (userInfo.status) {
      const [results] = await pool.query('select sv.song_id, sv.song_name, sv.song_avatar, sv.song_path, sv.author_name from songview as sv, author as a where a.author_name = sv.author_name and a.author_id = ?', [authorID]);

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

module.exports = { getAllSongs, getSongDetails, getSongs, getAuthorSongs };
