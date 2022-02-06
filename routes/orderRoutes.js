const express = require("express");
const authController = require("../controller/authController");
const orderController = require("../controller/orderController");

const orderRouter = express.Router();

orderRouter.get(
  "/",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderController.getOrders
);

orderRouter.get(
  "/details",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderController.getOrderById
);

orderRouter.post(
  "/update",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderController.updateOrder
);

orderRouter.post(
  "/updates",
  authController.protect,
  authController.restrictTo("admin", "warehouse", "pharmacy"),
  orderController.updateOrders
);

orderRouter.post(
  "/",
  authController.protect,
  authController.restrictTo("pharmacy"),
  orderController.saveOrder
);

orderRouter.get(
  "/unread",
  authController.protect,
  authController.restrictTo("admin", "warehouse"),
  orderController.getUnreadOrders
);

orderRouter.post(
  "/delete",
  authController.protect,
  authController.restrictTo("admin", "pharmacy", "warehouse"),
  orderController.deleteOrder
);

module.exports = orderRouter;
