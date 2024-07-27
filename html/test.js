const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  console.log(path.join(__dirname, "/upload_test.html"));
  res.sendFile(path.join(__dirname, "/upload_test.html"));
});

module.exports = router;
