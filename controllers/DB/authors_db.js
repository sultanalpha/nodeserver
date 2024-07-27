const mysql = require("mysql2");
require("dotenv").config();

var pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
  })
  .promise();

async function getAuthors(authorName, userID) {
  if (await checkUser(userID)) {
    const [results] = await pool.query(
      "SELECT * FROM author WHERE author_name LIKE CONCAT(?, '%')",
      [authorName]
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
  } else {
    return {
      status: false,
      errorCode: "772901x",
      message: "User doesnt have access for this resources!",
      data: null,
    };
  }
}

async function checkUser(userID) {
  const [results] = await pool.query(
    "SELECT * FROM users WHERE users_id = ? AND is_admin = true",
    [userID]
  );
  console.log({ userID, results });
  if (results.length == 0) {
    return false;
  } else {
    return true;
  }
}

async function searchAuthor(songid) {
  const [results] = await pool.query(
    "select s.song_id, a.author_id, a.author_name, a.author_desc, a.author_avatar from author as a, songs as s where s.song_id = ? and s.author_id = a.author_id;",
    [songid]
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
      data: results[0],
    };
  }
}
module.exports = { getAuthors, searchAuthor };
