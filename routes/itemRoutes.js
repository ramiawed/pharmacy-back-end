const express = require("express");
const itemController = require("../controller/itemController");
const authController = require("../controller/authController");
const itemRoutes = express.Router();

itemRoutes
  .route("/")
  .get(authController.protect, itemController.getItems)
  .post(
    authController.protect,
    authController.restrictTo("company"),
    itemController.addItem
  );

itemRoutes
  .route("/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("company"),
    itemController.updateItem
  );
itemRoutes
  .route("/active/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("company"),
    itemController.changeItemActiveState
  );

itemRoutes
  .route("/caliber/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("company"),
    itemController.handleCaliber
  );

itemRoutes
  .route("/warehouse/add-item/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.addItemToWarehouse
  );

itemRoutes
  .route("/warehouse/remove-item/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.removeItemFromWarehouse
  );

module.exports = itemRoutes;
