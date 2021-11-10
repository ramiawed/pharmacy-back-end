const express = require("express");
const authController = require("../controller/authController");
const advertisementController = require("../controller/advertisementController");

const advertisementRouter = express.Router();

advertisementRouter
  .route("/")
  .get(authController.protect, advertisementController.getAllAdvertisements)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    advertisementController.addAdvertisement
  );

advertisementRouter.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  advertisementController.uploadImage
);
