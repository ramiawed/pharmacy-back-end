const express = require("express");
const itemController = require("../controller/itemController");
const authController = require("../controller/authController");

const multer = require("multer");

const upload = multer();

const itemRoutes = express.Router();

itemRoutes
  .route("/")
  .get(authController.protect, itemController.getItems)
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
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

itemRoutes.get(
  "/allItem/:companyId",
  authController.protect,
  itemController.getAllItemsForCompany
);

itemRoutes
  .route("/excel")
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.addAndUpdateItems
  );

itemRoutes
  .route("/item/:itemId")
  .get(authController.protect, itemController.getItemById)
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.updateItem
  );

itemRoutes
  .route("/active/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("company", "admin"),
    itemController.changeItemActiveState
  );

itemRoutes
  .route("/warehouse/add-item/:itemId/:city")
  .post(
    authController.protect,
    authController.restrictTo("warehouse"),
    itemController.addItemToWarehouse
  );

itemRoutes
  .route("/warehouse/remove-item/:itemId/:city")
  .post(
    authController.protect,
    authController.restrictTo("warehouse", "admin"),
    itemController.removeItemFromWarehouse
  );

itemRoutes
  .route("/warehouse/change-max-qty/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse", "admin"),
    itemController.changeItemWarehouseMaxQty
  );

itemRoutes
  .route("/warehouse/change-offer/:itemId")
  .post(
    authController.protect,
    authController.restrictTo("warehouse", "admin"),
    itemController.changeOffer
  );

itemRoutes
  .route("/upload/:itemId")
  .post(
    upload.single("file"),
    authController.protect,
    itemController.uploadImage
  );

module.exports = itemRoutes;
