const express = require("express");
const authController = require("../controller/authController");
const advertisementController = require("../controller/advertisementController");

const multer = require("multer");

const upload = multer();

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
