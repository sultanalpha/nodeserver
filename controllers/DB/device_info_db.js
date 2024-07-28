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

async function getAllDevicesInfo(userID) {
  const [rows] = await pool.query(
    "SELECT * FROM device_info WHERE users_id = ?",
    [userID]
  );
  if (rows.length === 0) {
    return { status: false, data: null, errorCode: "772012x" };
  } else {
    return {
      status: true,
      data: rows,
      errorCode: null,
    };
  }
}

module.exports = { getAllDevicesInfo };
