const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const uploadRemixDB = require("../../controllers/DB/audio_files/upload_remix_db.js");
const response = require("../../controllers/response/response.js");
const JWTV2 = require("../../controllers/jwt/jwt_controller.js");
const jwtv2 = new JWTV2();
const path = require("path");

const randomBytes = crypto.randomBytes(16).toString("hex");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "audio") {
      cb(null, "songs_remix/");
    } else if (file.fieldname === "image") {
      cb(null, "song_remix_avatars/");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = randomBytes + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("Uploading remix");
    let privateRandom = crypto.randomBytes(16).toString("hex");
    const { songName, remixauthorID, songID } = req.body;

    if (!songName || !remixauthorID || !songID) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          Code: 400,
          Status: "Error",
          errorCode: "772010x",
          Message: "Some values are missing",
        })
      );
    }

    const audioFile = req.files["audio"][0];
    const imageFile = req.files["image"][0];
    const audioExt = path.extname(audioFile.path);
    const imageExt = path.extname(imageFile.path);
    try {
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        response.setInvalidTokenResponse(res);
      } else {
        const [bearer, token] = authorizationHeader.split(" ");
        if (bearer === "Bearer" && token) {
          const userInfo = await jwtv2.verify(token, { verify: {} });
          console.log("Checked auth token and it is valid");
          if (userInfo.status) {
            console.log(userInfo);
            const userData = userInfo.data;
            if (
              await uploadRemixDB.checkEligible(
                userData["userDetails"]["users_id"]
              )
            ) {
              console.log("Checked users is eligible to upload or no");
              const insertRemix = await uploadRemixDB.addRemixSongToDB(
                songName,
                privateRandom + imageExt,
                privateRandom + audioExt,
                remixauthorID,
                songID
              );

              if (insertRemix.errno == null) {
                console.log(
                  "nothing went wrong when inseting song to database"
                );
                fs.rename(
                  path.join("song_remix_avatars", randomBytes + imageExt),
                  path.join("song_remix_avatars", privateRandom + imageExt),
                  (err) => {
                    if (err) {
                      console.error(`Error during file upload: ${err}`);
                      if (req.files["audio"][0]) {
                        fs.unlinkSync(
                          path.join("songs_remix", randomBytes + audioExt)
                        );
                      }
                      if (req.files["image"][0]) {
                        fs.unlinkSync(
                          path.join(
                            "song_remix_avatars",
                            randomBytes + imageExt
                          )
                        );
                      }
                      res.writeHead(500, {
                        "Content-Type": "application/json",
                      });

                      res.end(
                        JSON.stringify({
                          Code: 500,
                          Status: "Error",
                          errorCode: "772202x",
                          Message: "File upload failed Database error",
                        })
                      );
                      return;
                    } else {
                      fs.rename(
                        path.join("songs_remix", randomBytes + audioExt),
                        path.join("songs_remix", privateRandom + audioExt),
                        (err) => {
                          if (err) {
                            console.error(
                              "Error during file upload: Database error"
                            );
                            if (req.files["audio"][0]) {
                              fs.unlinkSync(
                                path.join("songs_remix", randomBytes + audioExt)
                              );
                            }
                            if (req.files["image"][0]) {
                              fs.unlinkSync(
                                path.join(
                                  "songs_remix_avatar",
                                  randomBytes + imageExt
                                )
                              );
                            }

                            res.writeHead(500, {
                              "Content-Type": "application/json",
                            });
                            res.end(
                              JSON.stringify({
                                Code: 500,
                                Status: "Error",
                                errorCode: "772202x",
                                Message: "File upload failed Database error",
                              })
                            );
                            return;
                          } else {
                            res.writeHead(200, {
                              "Content-Type": "application/json",
                            });
                            res.end(
                              JSON.stringify({
                                Code: 200,
                                Status: "Success",
                                errorCode: null,
                                Message: `File uploaded successfully.`,
                              })
                            );
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                if (req.files["audio"][0]) {
                  fs.unlinkSync(
                    path.join("songs_remix", randomBytes + audioExt)
                  );
                }
                if (req.files["image"][0]) {
                  fs.unlinkSync(
                    path.join("songs_remix_avatar", randomBytes + imageExt)
                  );
                }

                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    Code: 500,
                    Status: "Error",
                    errorCode: "772202x",
                    Message: "File upload failed Database error",
                  })
                );
              }
            } else {
              console.error("Error during file upload: Database error");
              if (req.files["audio"][0]) {
                fs.unlinkSync(path.join("songs_remix", randomBytes + audioExt));
              }
              if (req.files["image"][0]) {
                fs.unlinkSync(
                  path.join("songs_remix_avatar", randomBytes + imageExt)
                );
              }
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  Code: 400,
                  Status: "Error",
                  errorCode: "772902x",
                  Message:
                    "You don't have enough privileges to do this action!",
                })
              );
            }
          } else {
            console.log("header sent in line 213 with code 400");
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                Code: 400,
                Status: "Error",
                errorCode: userInfo.errorCode,
                Message: userInfo.message,
              })
            );
          }
        } else {
          response.setInvalidTokenResponse(res);
        }
      }
    } catch (error) {
      console.log(error);
      if (req.files["audio"][0]) {
        fs.unlinkSync(path.join("songs_remix", randomBytes + audioExt));
      }
      if (req.files["image"][0]) {
        fs.unlinkSync(path.join("songs_remix_avatar", randomBytes + imageExt));
      }

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          Code: 500,
          Status: "Error",
          errorCode: "772202x",
          Message: "File upload failed",
        })
      );
    }
  }
);

module.exports = router;
