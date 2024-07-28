const mysql = require("mysql2");
require("dotenv").config();

var pool = mysql
  .createPool({
    host: process.env.DB_USER,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  })
  .promise();

async function getSongDetails(songID) {
  const [results] = await pool.query("SELECT * FROM songs WHERE song_id = ?", [
    songID,
  ]);
  if (results.length == 0) {
    console.log("Is admin false");
    return {
      status: false,
      errorCode: "772012x",
      message: "No results were found",
      data: null,
    };
  } else {
    return {
      status: true,
      errorCode: null,
      message: "Success",
      data: results,
    };
  }
}

module.exports = { getSongDetails };
