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
function addOneDay() {
  const currentDate = new Date();
  const nextDay = new Date(currentDate);
  nextDay.setDate(currentDate.getDate() + 2);
  const formattedNextDay = nextDay.toISOString().slice(0, 19).replace("T", " ");
  return formattedNextDay;
}

async function insertTokenToDB(usersID, refreshToken, ipAddress) {
  const refreshData = await checkIDinDB(usersID, ipAddress);
  console.log(`The refreshData is ${JSON.stringify(refreshData)}`);
  if (refreshData !== null) {
    try {
      const [results] = await pool.query(
        "UPDATE refresh_token SET refresh_token = ?, refresh_exp = ? WHERE users_id = ? AND ip_address = ?",
        [refreshToken, addOneDay(), usersID, ipAddress]
      );
      console.log(`The updated token results: ${refreshData.refresh_id}`);
      return {
        status: true,
        results: results,
        refreshTokenID: refreshData.refresh_id,
      };
    } catch (error) {
      return error;
    }
  } else {
    try {
      const [results] = await pool.query(
        "INSERT INTO refresh_token (refresh_id, refresh_token, refresh_exp, ip_address, users_id) VALUES (?, ?, ?, ?, ?)",
        [null, refreshToken, addOneDay(), ipAddress, usersID]
      );
      console.log(`The Inserted token results: ${results}`);
      return {
        status: true,
        results: results.insertId,
        refreshTokenID: results.insertId,
      };
    } catch (error) {
      return error;
    }
  }
}
async function checkIDinDB(userID, ipAddress) {
  const [results] = await pool.query(
    "SELECT * FROM refresh_token WHERE users_id = ? AND ip_address = ?",
    [userID, ipAddress]
  );
  if (results.length === 0) {
    return null;
  } else {
    return results[0];
  }
}

async function checkTokeninDB(refreshToken) {
  const [results] = await pool.query(
    "SELECT * FROM refresh_token WHERE refresh_token = ?",
    [refreshToken]
  );
  if (results.length === 0) {
    return null;
  } else {
    return results[0];
  }
}

module.exports = { insertTokenToDB, checkTokeninDB };
