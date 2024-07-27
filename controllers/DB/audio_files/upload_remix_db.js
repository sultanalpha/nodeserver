const mysql = require("mysql2");
require("dotenv").config();

var pool = mysql
  .createPool({
    host: 'sql.freedb.tech',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
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

async function addRemixSongToDB(remixName, remixAvatar, remixPath, remixauthorID, songID) {
  try {
    const [results] = await pool.query(
      "INSERT INTO remix_song (remix_id, remix_name, remix_avatar, remix_path, remix_author_id, song_id) VALUES (?, ?, ?, ?, ?, ?)",
      [null, remixName, remixAvatar, remixPath, remixauthorID, songID]
    );
    console.log("data inserted successfully");
    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = { checkEligible, addRemixSongToDB };
