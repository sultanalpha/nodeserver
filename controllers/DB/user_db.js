const mysql = require("mysql2");
const crypto = require("crypto-js");
const old_crypto = require('crypto');
const emailValidator = require("email-validator");
require("dotenv").config();

const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

const DeviceDetector = require("node-device-detector");
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
  deviceTrusted: false,
  deviceInfo: false,
  maxUserAgentSize: 500,
});

var pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
  })
  .promise();

async function loginResult(username, password, userAgent, ipAddress) {
  if (
    username.length < 8 ||
    (username.length > 32 && password.length < 8) ||
    password.length > 32
  ) {
    return {
      status: false,
      error_type: "Username and password length invalid!",
    };
  }
  if (username.length < 8 || username.length > 32) {
    return {
      status: false,
      error_type: "Username length invalid!",
    };
  }
  if (password.length < 8 || password.length > 32) {
    return {
      status: false,
      error_type: "Password length invalid!",
    };
  }

  // Hash the provided password to SHA-256
  const hashedPassword = crypto.SHA256(password).toString();
  const [results] = await pool.query(
    `SELECT users_id, users_name, users_email, users_identifier, created_time, users_avatar FROM users WHERE users_name = ? AND users_password = ?`,
    [username, hashedPassword]
  );
  if (results.length === 0) {
    return {
      status: false,
      error_type: "Username or password is wrong!",
    };
  } else {
    const payload = {
      userDetails: results[0],
    };

    const token = await jwtv2.createJWT(payload, ipAddress);
    console.log("Creating token with this refreshToken: " + token.refreshToken);
    const d = await insertDeviceInfo(
      userAgent,
      token.refreshToken,
      results[0].users_id
    );
    console.log("Trying to add device info: " + userAgent);
    if (d.status) {
      return {
        status: true,
        data: results[0],
        token: token.token,
      };
    } else {
      return {
        status: false,
        data: null,
        token: null,
      };
    }
  }
}

async function registerUser(
  username,
  email,
  password,
  confirmPassowrd,
  ipAddress,
  userAgent
) {
  if (password != confirmPassowrd) {
    return {
      status: false,
      error_type: "Password and confirm password doesn't match!",
    };
  }

  if (!emailValidator.validate(email)) {
    return {
      status: false,
      error_type: "Invalid email!",
    };
  }
  if (username.length < 8 || username.length > 32) {
    return {
      status: false,
      error_type: "Username length invalid!",
    };
  }
  if (password.length < 8 || password.length > 32) {
    return {
      status: false,
      error_type: "Password length invalid!",
    };
  }

  const isUsernameTaken = await checkUsername(username);
  const isEmailTaken = await checkEmail(email);
  if (isUsernameTaken && isEmailTaken) {
    return {
      status: false,
      error_type: "Username and email already taken rly bro?",
    };
  }
  if (isUsernameTaken) {
    return {
      status: false,
      error_type: "Username already taken please try another one",
    };
  }
  if (isEmailTaken) {
    return {
      status: false,
      error_type: "email already taken please try another one",
    };
  }

  const hashedPassword = crypto.SHA256(password).toString();
  const randomIdentifier = generateRandomString(7);
  const [results] = await pool.query(
    `INSERT INTO users (users_id, users_name, users_email, users_password, users_identifier ,created_time, ip_address, users_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      null,
      username,
      email,
      hashedPassword,
      randomIdentifier,
      null,
      ipAddress,
      "user-96.png",
    ]
  );
  const id = results.insertId;
  const result = await loginResult(username, password, userAgent, ipAddress);
  if (result.status) {
    return {
      status: true,
      // token: await getUserDetails(id),
      token: result.token,
      data: result.data,
      error_type: result.error_type
    };
  } else {

  }

}

async function checkUsername(username) {
  const [results] = await pool.query(
    `SELECT * FROM users WHERE users_name = ?`,
    [username]
  );
  return results.length > 0;
}
async function checkEmail(email) {
  const [results] = await pool.query(
    `SELECT * FROM users WHERE users_email = ?`,
    [email]
  );
  return results.length > 0;
}

async function deleteRefreshToken(refreshID) {
  const [results] = await pool.query(
    `DELETE FROM refresh_token WHERE refresh_id = ?`,
    [refreshID]
  );
  console.log(`The delete results are: ${results}`);
  return results.affectedRows;
}

async function getUserDetails(userID) {
  const [results] = await pool.query(
    `SELECT users_id, users_name, users_email, created_time, users_avatar, is_admin FROM users WHERE users_id = ?`,
    [userID]
  );
  if (results.length > 0) {
    return results[0];
  } else {
    return null;
  }
}

async function changeUserPassword(userID, newPassword, oldPassword) {
  if (newPassword.length < 8) {
    return {
      status: false,
      ErrorCode: "772067x",
      message: "Invalid password length",
      data: null,
    };
  }

  const hashedOldPassword = crypto.SHA256(oldPassword).toString();
  console.log(`The old hashed password is: ${hashedOldPassword}`)
  const [query] = await pool.query(
    "SELECT * FROM users WHERE users_id = ? AND users_password = ?",
    [userID, hashedOldPassword]
  );
  if (query.length > 0) {
    const hashedPassword = crypto.SHA256(newPassword).toString();
    const [results] = await pool.query(
      "UPDATE users SET users_password = ? WHERE users_id = ?",
      [hashedPassword, userID]
    );
    if (results.affectedRows > 0) {
      return {
        status: true,
        ErrorCode: null,
        message: "Password updated successfully",
        data: results,
      };
    } else {
      return {
        status: false,
        ErrorCode: "772003x",
        message: "Something went wrong while changing the password",
        data: null,
      };
    }
  } else {
    return {
      status: false,
      ErrorCode: "772068x",
      message: "Wrong old password provided",
      data: null,
    };
  }
}

async function insertDeviceInfo(userAgent, refreshToken, userID) {
  console.log(`The data are: ${userAgent}, ${refreshToken}, ${userID}`);
  try {
    const [check] = await pool.query(
      "SELECT * FROM device_info WHERE refresh_id = ?",
      [refreshToken]
    );
    console.log(`The device info check: ${JSON.stringify(check)}`);
    if (check.length === 0) {
      const result = detector.detect(userAgent);
      console.log("result parse", result);
      const os = result.os;
      const client = result.client;
      const device = result.device;
      const results = await pool.query(
        `INSERT INTO device_info (device_info_id, os_name, os_short_name, os_version, os_platform, os_family, device_id, device_type, device_brand, device_model, client_type, client_name, client_short_name, client_version, refresh_id, users_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          null,
          os.name,
          os.shortName,
          os.version,
          os.platform,
          os.family,
          device.id,
          device.type,
          device.brand,
          device.model,
          client.type,
          client.name,
          client.short_name,
          client.version,
          refreshToken,
          userID,
        ]
      );
      console.log(`The refreshID is: ${refreshToken}`);
      return {
        status: true,
        error: null,
        data: results,
      };
    } else {
      return {
        status: true,
        error: null,
        data: null,
      };
    }
  } catch (err) {
    console.log("ERROR: " + err);
    return {
      status: false,
      error: err,
      data: null,
    };
  }
}

function generateRandomString(length) {
  const buffer = old_crypto.randomBytes(length);
  return buffer.toString("hex");
}

module.exports = {
  loginResult,
  registerUser,
  getUserDetails,
  changeUserPassword,
  deleteRefreshToken
};
