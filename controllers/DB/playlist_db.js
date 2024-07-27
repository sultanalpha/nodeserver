const mysql = require("mysql2");
require("dotenv").config();

var pool = mysql
  .createPool({
    host: 'sql.freedb.tech',
    user: 'freedb_sultanking',
    password: '%E!9Sq5BpgXpVyE',
    database: 'freedb_sultan2',
    port: 3306
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
