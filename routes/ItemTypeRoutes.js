const express = require("express");
const authController = require("../controller/authController");
const itemTypeController = require("../controller/itemTypeController");

const itemTypeRoute = express.Router();

itemTypeRoute
  .route("/")
  .get(itemTypeController.getAllItemTypes)
  .post(
    authController.protect,
    authController.restrictTo("Admin"),
    itemTypeController.addItemType
  );

itemTypeRoute
  .route("/:itemTypeId")
  .patch(
    authController.protect,
    authController.restrictTo("Admin"),
    itemTypeController.updateItemType
  )
  .delete(
    authController.protect,
    authController.restrictTo("Admin"),
    itemTypeController.deleteItemType
  );

module.exports = itemTypeRoute;
