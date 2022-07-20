const express = require("express");
const authController = require("../controller/authController");
const savedItemsController = require("../controller/savedItemsController");

const savedItemRouter = express.Router();

savedItemRouter.get(
  "/",
  authController.protect,
  savedItemsController.getSavedItems
);

savedItemRouter.post(
  "/add",
  authController.protect,
  savedItemsController.addSavedItem
);

savedItemRouter.post(
  "/remove",
  authController.protect,
  savedItemsController.removeSaveItem
);

module.exports = savedItemRouter;
