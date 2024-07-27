const express = require("express");
const router = express.Router();

const userDB = require("../../controllers/DB/user_db.js");
const response = require("../../controllers/response/response.js");
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

router.all("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  const respond = response.customJSONResponse(
    200,
    "Huh?",
    null,
    "What are you doing here? >:("
  );
  res.end(respond);
});

router.post("/change_password", async (req, res) => {
  const { pass, password, confirmPassword } = req.body;
  const authorizationHeader = req.headers.authorization;
  if (!pass || !password || !confirmPassword) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
    return;
  }
  if (password != confirmPassword) {
    res.end(
      response.customJSONResponse(
        400,
        "Error",
        "772066x",
        "New password and new confirm password doesn't match!"
      )
    );
    return;
  }
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
    return;
  }

  const [bearer, token] = authorizationHeader.split(" ");
  if (bearer === "Bearer" && token) {
    try {
      const userInfo = await jwtv2.verify(token, { verify: {} });
      if (userInfo.status) {
        // console.log(
        //   `changing passwrod with this payload: ${JSON.stringify(userInfo)}`
        // );
        const results = await userDB.changeUserPassword(
          userInfo.data["userDetails"]["users_id"],
          password,
          pass
        );
        if (results.status) {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(
            response.customJSONResponse(
              200,
              "Success",
              null,
              results.message,
              results.data
            )
          );
        } else {
          console.log("Trying to change password");
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              results.ErrorCode,
              results.message
            )
          );
        }
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          response.customJSONResponse(
            401,
            "Error",
            "772102x",
            "Invalid token provided",
            error
          )
        );
      }
    } catch (error) {
      res.writeHead(401, { "Content-Type": "application/json" });
      if (error.name === "TokenExpiredError") {
        res.end(
          response.customJSONResponse(
            401,
            "Error",
            "772001x",
            "Invalid request",
            error
          )
        );
      }
    }
  } else {
    res.writeHead(401, {
      "Content-Type": "application/json",
    });
    res.end(
      response.customJSONResponse(
        401,
        "Error",
        "772009x",
        "Invalid request",
        error
      )
    );
  }
});

router.get("/user_info", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      try {
        const userInfo = (await jwtv2.verify(token, { verify: {} })).data;
        console.log(userInfo);
        console.log("Setting header 200 in auth.sj 30");
        const results = await userDB.getUserDetails(
          userInfo["userDetails"]["users_id"]
        );
        console.log(results);
        if (results != null) {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(
            response.customJSONResponse(
              200,
              "Success",
              null,
              "Vaild request",
              results
            )
          );
        } else {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772003x",
              "Invalid request",
              error
            )
          );
        }
      } catch (error) {
        console.log("Setting header 401 in auth.sj 33");
        res.writeHead(401, { "Content-Type": "application/json" });
        if (error.name === "TokenExpiredError") {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772001x",
              "Invalid request",
              error
            )
          );
        } else {
          res.end(
            response.customJSONResponse(
              401,
              "Error",
              "772009x",
              "Invalid request",
              error
            )
          );
        }
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

router.get("/update_tk", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  const ipAddress = req.socket.remoteAddress;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      const data = await jwtv2.updateJWT(token, ipAddress);
      if (data.status === true) {
        res.writeHead(200, { "Content-Type": "application/json" });
        const customResponse = JSON.stringify({
          Code: 200,
          Status: "Success",
          ErrorCode: null,
          Message: data.message,
          accessToken: data.accessToken.token,
        });
        res.end(customResponse);
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          response.customJSONResponse(
            400,
            "Error",
            data.errorCode,
            data.message,
            data.accessToken
          )
        );
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password, email } = req.body;
  const userAgent = req.headers["user-agent"];
  const ipAddress = req.socket.remoteAddress;

  if (!username && !email) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
    return;
  }
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
  } else {
    const result = await userDB.loginResult(
      username,
      password,
      userAgent,
      ipAddress
    );

    if (result.status) {
      // const payload = {
      //   userDetails: result.data,
      // };

      // const token = await jwtv2.createJWT(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(response.successJSONResponse(result.token));
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(response.failedJSONResponse(result.error_type));
    }
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const userAgent = req.headers["user-agent"];
  const ipAddress = req.socket.remoteAddress;

  const result = await userDB.registerUser(
    username,
    email,
    password,
    confirmPassword,
    ipAddress,
    userAgent
  );

  if (!username || !email || !password || !confirmPassword || !ipAddress) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(response.failedJSONResponse("Missing some required fields"));
  } else {
    if (result.status) {
      console.log("Setting header 200 in auth.sj 118");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(response.successJSONResponse(result.token));
    } else {
      console.log("Setting header 400 in auth.sj 122");
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(response.failedJSONResponse(result.error_type));
    }
  }
});

router.get("/logout", async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    response.setInvalidTokenResponse(res);
  } else {
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer === "Bearer" && token) {
      refreshID = jwtv2.checkToken(token).data;
      const results = await userDB.deleteRefreshToken(refreshID);
      if (results == 1) {
        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.end(
          response.customJSONResponse(
            200,
            "Success",
            null,
            "Vaild request",
            results
          )
        );
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          response.customJSONResponse(
            401,
            "Error",
            "772004x",
            "No affectedRows :(",
            "null"
          )
        );
      }
    } else {
      response.setInvalidTokenResponse(res);
    }
  }
});

module.exports = router;
