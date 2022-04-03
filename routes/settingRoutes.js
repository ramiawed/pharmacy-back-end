const express = require("express");
const authController = require("../controller/authController");
const settingController = require("../controller/settingController");

const settingRouter = express.Router();

settingRouter.get(
  "/",
  authController.protect,
  settingController.getAllSettings
);

settingRouter.get(
  "/all",
  authController.protect,
  authController.restrictTo("admin"),
  settingController.getAllForBackup
);

settingRouter.post(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  settingController.updateSetting
);

settingRouter.post(
  "/restore",
  authController.protect,
  authController.restrictTo("admin"),
  settingController.restoreData
);

module.exports = settingRouter;
