const express = require("express");
const authController = require("../controller/authController");
const orderBasketController = require("../controller/basketOrdersController");
const basketOrdersRoutes = express.Router();

basketOrdersRoutes.get(
  "/",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderBasketController.getBasketOrders
);

basketOrdersRoutes.get(
  "/all",
  authController.protect,
  authController.restrictTo("admin"),
  orderBasketController.getAllBasketOrders
);

basketOrdersRoutes.get(
  "/details",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderBasketController.getBasketOrderById
);

basketOrdersRoutes.post(
  "/restore",
  authController.protect,
  authController.restrictTo("admin"),
  orderBasketController.restoreData
);

basketOrdersRoutes.post(
  "/update",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderBasketController.updateBasketOrder
);

basketOrdersRoutes.post(
  "/updates",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderBasketController.updateBasketOrders
);

basketOrdersRoutes.post(
  "/",
  authController.protect,
  authController.restrictTo("pharmacy"),
  orderBasketController.addBasketOrder
);

basketOrdersRoutes.get(
  "/unread",
  authController.protect,
  authController.restrictTo("admin", "warehouse"),
  orderBasketController.getUnreadBasketOrders
);

basketOrdersRoutes.post(
  "/delete",
  authController.protect,
  authController.restrictTo("admin", "pharmacy", "warehouse"),
  orderBasketController.deleteBasketOrder
);

module.exports = basketOrdersRoutes;
