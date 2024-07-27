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
