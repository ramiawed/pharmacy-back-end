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

statisticsRouter.post(
  "/orders",
  authController.protect,
  statisticsController.incrementOrders
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

statisticsRouter.get("/users", statisticsController.getUsersStatistics);
statisticsRouter.get("/items", statisticsController.getItemsStatistics);

module.exports = statisticsRouter;
