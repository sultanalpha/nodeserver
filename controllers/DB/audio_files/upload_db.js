const mysql = require("mysql2");
require("dotenv").config();

var pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  })
  .promise();

async function checkEligible(userID) {
  const [results] = await pool.query(
    "SELECT * FROM users WHERE users_id = ? AND is_admin = 1",
    [userID]
  );
  console.log(results);
  if (results.length == 0) {
    return false;
  } else {
    return true;
  }
}

async function addSongToDB(songName, songAvatar, songPath, authorID) {
  console.log(
    `SQL CODE: INSERT INTO songs (song_id, song_name, song_avatar, song_path, author_id) VALUES (${null}, ${songName}, ${songAvatar}, ${songPath}, ${authorID})`
  );
  try {
    const [results] = await pool.query(
      "INSERT INTO songs (song_id, song_name, song_avatar, song_path, author_id) VALUES (?, ?, ?, ?, ?)",
      [null, songName, songAvatar, songPath, authorID]
    );
    return {
      status: true,
      data: results,
      error: null
    };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: error
    };
  }
}

module.exports = { checkEligible, addSongToDB };
