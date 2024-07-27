const express = require("express");
const router = express.Router();
const response = require("../../controllers/response/response.js");
const deviceInfoDB = require("../../controllers/DB/device_info_db.js");
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();

router.all("/", async (req, res) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      response.setInvalidTokenResponse(res);
    } else {
        const [bearer, token] = authorizationHeader.split(" ");
        if (bearer === "Bearer" && token) {
          try {
            const userInfo = (await jwtv2.verify(token, { verify: {}})).data;
            console.log(userInfo);
            const results = await deviceInfoDB.getAllDevicesInfo(userInfo['userDetails']['users_id']);
            if(results.status) {
              const deviceResults = results.data;
              res.writeHead(200, {
                "Content-Type": "application/json",
              });
              res.end(JSON.stringify(
                {
                  Code: 200,
                  Status: "Success",
                  ErrorCode: null,
                  Message: "Vaild request",
                  currentSessionID: userInfo.refresh_id,
                  Data: deviceResults
                }
              ));
                // res.end(response.customJSONResponse(200, "Success", null, "Vaild request", results.data));
            } else {
              res.writeHead(401, {
                "Content-Type": "application/json",
              });
                res.end(response.customJSONResponse(401, "Error", results.errorCode, "Invalid request", ""));
            }

          }
            catch (error) {
                console.log(`ERROR: ${error}`)
                res.writeHead(401, { "Content-Type": "application/json" });
                if(error.name === "TokenExpiredError"){

                  res.end(response.customJSONResponse(401, "Error", "772001x", "Invalid request", error));
                } else {
                  res.end(response.customJSONResponse(401, "Error", "772009x", "Invalid request", error));
                }
                
              }
            }
        }
});

module.exports = router;
