const express = require("express");
const authController = require("../controller/authController");
const advertisementController = require("../controller/advertisementController");
const Advertisement = require("../models/advertisementModel.js");

// muter configurations
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/advertisements");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
    req.name = name;
  },
});
const upload = multer({ storage: storage });

const advertisementRouter = express.Router();

advertisementRouter
  .route("/")
  .get(authController.protect, advertisementController.getAllAdvertisements);

advertisementRouter.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  authController.restrictTo("admin"),
  advertisementController.addAdvertisement
);

advertisementRouter.post(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  advertisementController.deleteAdvertisement
);

module.exports = advertisementRouter;
