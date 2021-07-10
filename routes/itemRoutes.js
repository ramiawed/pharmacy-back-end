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
  .route("/warehouseItems")
  .get(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.getItemsByWarehouseId
  );

itemRoutes
  .route("/:companyId")
  .get(authController.protect, itemController.getItemsByCompanyId);

itemRoutes
  .route("/excel")
  .post(
    authController.protect,
    authController.restrictTo("company"),
    itemController.addItems
  );

itemRoutes
  .route("/item/:itemId")
  .get(authController.protect, itemController.getItemById)
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

itemRoutes
  .route("/warehouse/change-max-qty/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.changeItemWarehouseMaxQty
  );

itemRoutes
  .route("/warehouse/change-offer/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.changeOffer
  );

module.exports = itemRoutes;
