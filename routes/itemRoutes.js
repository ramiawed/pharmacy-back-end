const express = require("express");
const itemController = require("../controller/itemController");
const authController = require("../controller/authController");
const itemRoutes = express.Router();

itemRoutes.post(
  "/",
  authController.protect,
  authController.restrictTo("Company"),
  itemController.addItem
);

itemRoutes
  .route("/:itemId")
  .patch(
    authController.protect,
    authController.restrictTo("Company"),
    itemController.updateItem
  );
itemRoutes
  .route("/active/:itemId")
  .patch(
    authController.protect,
    authController.restrictTo("Company"),
    itemController.changeItemActiveState
  );

itemRoutes
  .route("/caliber/:itemId")
  .patch(
    authController.protect,
    authController.restrictTo("Company"),
    itemController.handleCaliber
  );

itemRoutes
  .route("/warehouse/add-item/:itemId")
  .patch(
    authController.protect,
    authController.restrictTo("Warehouse"),
    itemController.addItemToWarehouse
  );

itemRoutes
  .route("/warehouse/remove-item/:itemId")
  .patch(
    authController.protect,
    authController.restrictTo("Warehouse"),
    itemController.removeItemFromWarehouse
  );

module.exports = itemRoutes;
