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
