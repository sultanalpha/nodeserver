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
    return results;
  } catch (error) {
    return error;
  }
}

module.exports = { checkEligible, addSongToDB };
