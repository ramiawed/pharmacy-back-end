const express = require("express");
const statisticsController = require("../controller/statisticsController");
const authController = require("../controller/authController");

const statisticsRouter = express.Router();

// user statistics
statisticsRouter
  .route("/signin")
  .post(authController.protect, statisticsController.incrementSigninCount);

statisticsRouter.post(
  "/selectedCompany",
  authController.protect,
  statisticsController.incrementSelectedCompany
);

statisticsRouter.get(
  "/all",
  authController.protect,
  authController.restrictTo("admin"),
  statisticsController.getAllStatistics
);

statisticsRouter.post(
  "/orders",
  authController.protect,
  statisticsController.incrementOrders
);

statisticsRouter.post(
  "/restore",
  authController.protect,
  authController.restrictTo("admin"),
  statisticsController.restoreData
);

statisticsRouter.post(
  "/favorite",
  authController.protect,
  statisticsController.incrementFavorites
);

// item statistics
statisticsRouter.post(
  "/favoriteItem",
  authController.protect,
  statisticsController.incrementFavoritesItem
);

statisticsRouter.post(
  "/itemAddedToCart",
  authController.protect,
  statisticsController.addedToCart
);

statisticsRouter.post(
  "/selectedItem",
  authController.protect,
  statisticsController.incrementSelectedItem
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

statisticsRouter.get("/users", statisticsController.getUsersStatistics);
statisticsRouter.get("/items", statisticsController.getItemsStatistics);

module.exports = statisticsRouter;
