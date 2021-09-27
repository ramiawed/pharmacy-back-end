const express = require("express");
const authController = require("../controller/authController");
const settingController = require("../controller/settingController");

const settingRouter = express.Router();

settingRouter.get(
  "/",
  authController.protect,
  settingController.getAllSettings
);
settingRouter.post(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  settingController.updateSetting
);

module.exports = settingRouter;
