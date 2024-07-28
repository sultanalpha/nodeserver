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

async function get_playlists() {
  const [results] = await pool.query("SELECT * FROM allplaylistview");
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
}

async function get_playlist_song(id) {
  const [results] = await pool.query(
    "SELECT * FROM playlistview WHERER playlist_id = ?",
    [id]
  );
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
}

module.exports = { get_playlists, get_playlist_song };
