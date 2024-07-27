const jwt = require("jsonwebtoken");
require("dotenv").config();
const crypto = require("crypto");
const { insertTokenToDB, checkTokeninDB } = require("../DB/jwt_db.js");
const { platform } = require("os");

function generateRandomString(length) {
  const buffer = crypto.randomBytes(length);
  return buffer.toString("hex");
}

function checkTime(dbExpTime) {
  const currentDate = new Date();
  const givenTimestamp = new Date(dbExpTime);
  const isLessThanCurrent = givenTimestamp > currentDate;
  console.log(currentDate + " " + givenTimestamp);
  return isLessThanCurrent;
}

class JwtV2 {
  constructor() {
    this.secretToken = '81O7onYIj2nfA7whLDgHPuB7AS8EYK3sBx+oh+6v6ij4f11gtE0dvu+GUWG88xXsfNmAdAeBayMndO/BXPIyo7kJQvVHeH6u3fwbfVVWWP+82eLvMV10n9wCe7Uzs7zrveBx3lJ8p9Mg1Fqq1qJyWWNFh4XJVFWPcECJdTMJdyF19QNLkNac8LZzU9O+6eti';
  }

  async createJWT(payload, ipAddress) {
    const randomString = generateRandomString(32);
    payload["refresh_token"] = randomString;
    const id = await insertTokenToDB(
      payload["userDetails"]["users_id"],
      randomString,
      ipAddress
    );
    console.log(id);
    payload["refresh_id"] = id.refreshTokenID;
    
    return {
      status: true,
      token: jwt.sign(payload, this.secretToken, { expiresIn: "1h" }),
      refreshToken: id.refreshTokenID,
    };
  }

  async updateJWT(token, ipAddress) {
    const decoded = jwt.decode(token, this.secretToken);

    console.log(decoded);
    if(!decoded) {
      return {
        status: false,
        message: "Invalid access token",
        data: null,
        errorCode: "772009x"
      } 
    }

    const refreshTokenDetails = await checkTokeninDB(decoded["refresh_token"]);
    delete decoded.exp;
    delete decoded.iat;

    if (refreshTokenDetails !== null) {
      if (refreshTokenDetails["refresh_token"] === decoded["refresh_token"]) {
        if (checkTime(refreshTokenDetails["refresh_exp"])) {
          const token = await this.createJWT(decoded, ipAddress);
          return {
            status: true,
            message: "Updated token",
            accessToken: token,
            errorCode: null
          };
        } else {
          return {
            status: false,
            message: "Refresh token died please login again",
            accessToken: null,
            errorCode: "772101x"
          }
        }
      } else {
        return {
          status: false,
          message: "Invalid refresh token provided for this user",
          accessToken: null,
          errorCode: "772102x"
        }
      }
    } else {
      return {
        status: false,
        message: "Refresh token couldnt be found",
        accessToken: null,
        errorCode: "772103x"
      }
    }
  }

  checkToken(token) {
    const decoded = jwt.decode(token, this.secretToken);
    console.log(decoded);
    if(!decoded) {
      return {
        status: false,
        message: "Invalid access token",
        data: null,
        errorCode: "772009x"
      } 
    }
    const refreshID = decoded['refresh_id'];

    return {
      status: true,
      message: "Vaild token",
      data: refreshID,
      errorCode: null
    } 
  }

  async verify(token, refreshOptions) {
    const decoded = jwt.decode(token, this.secretToken);
    if(!decoded) {
      return {
        status: false,
        message: "Invalid access token",
        data: null,
        errorCode: "772009x"
      } 
    }
    const refreshTokenDetails = await checkTokeninDB(decoded["refresh_token"]);
    if (refreshTokenDetails !== null) {
      if (refreshTokenDetails["refresh_token"] === decoded["refresh_token"]) {
        if (checkTime(refreshTokenDetails["refresh_exp"])) {
          try {
            const data = jwt.verify(token, this.secretToken, refreshOptions.verify);
          return {
            status: true,
            message: "Valid token",
            data: data,
            errorCode: null
          }
          } catch (error) {
            return {
              status: false,
              message: 'Invalid token',
              data: error,
              errorCode: '772001x'
            }
          }
        } else {
          return {
            status: false,
            message: "Refresh token died please login again",
            data: null,
            errorCode: "772101x"
          }
        }
      } else {
        return {
          status: false,
          message: "Invalid refresh token provided for this user",
          data: null,
          errorCode: "772102x"
        }
      }
    } else {
      return {
        status: false,
        message: "Refresh token couldnt be found",
        data: null,
        errorCode: "772103x"
      }
    }

  }
}


module.exports = JwtV2;