const express = require("express");
const testController = require("../controller/testController");

const multer = require("multer");
const upload = multer({ dest: "public/profiles/" });

const testRoutes = express.Router();

testRoutes.post("/upload", upload.single("photo"), testController.uploadImage);

module.exports = testRoutes;
