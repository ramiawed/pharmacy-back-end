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
  "/",
  authController.protect,
  authController.restrictTo("pharmacy"),
  orderController.saveOrder
);

orderRouter.get(
  "/unread-admin",
  authController.protect,
  authController.restrictTo("admin"),
  orderController.getUnreadOrderForAdmin
);

orderRouter.get(
  "/unread-warehouse/:warehouseId",
  authController.protect,
  authController.restrictTo("warehouse"),
  orderController.getUnreadOrderForWarehouse
);

module.exports = orderRouter;
