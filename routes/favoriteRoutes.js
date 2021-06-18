const express = require("express");
const authController = require("../controller/authController");
const favoriteController = require("../controller/favoriteController");

const favoriteRouter = express.Router();

favoriteRouter.get(
  "/",
  authController.protect,
  favoriteController.getFavorites
);

favoriteRouter.get(
  "/items",
  authController.protect,
  favoriteController.addFavoriteItem
);

favoriteRouter.post(
  "/add",
  authController.protect,
  favoriteController.addFavorite
);

favoriteRouter.post(
  "/remove",
  authController.protect,
  favoriteController.removeFavorite
);

favoriteRouter.post(
  "/add/item",
  authController.protect,
  favoriteController.addFavoriteItem
);

favoriteRouter.post(
  "/remove/items",
  authController.protect,
  favoriteController.removeFavoriteItem
);

module.exports = favoriteRouter;
