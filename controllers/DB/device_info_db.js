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
