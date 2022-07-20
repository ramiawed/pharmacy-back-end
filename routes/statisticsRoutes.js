const express = require("express");
const statisticsController = require("../controller/statisticsController");
const authController = require("../controller/authController");

const statisticsRouter = express.Router();

statisticsRouter.get(
  "/all",
  authController.protect,
  authController.restrictTo("admin"),
  statisticsController.getAllStatistics
);

statisticsRouter.post(
  "/restore",
  authController.protect,
  authController.restrictTo("admin"),
  statisticsController.restoreData
);

statisticsRouter.post(
  "/",
  authController.protect,
  statisticsController.addStatistics
);

statisticsRouter.get(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  statisticsController.getStatistics
);

module.exports = statisticsRouter;
