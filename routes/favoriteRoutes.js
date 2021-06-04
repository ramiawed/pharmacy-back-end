const express = require("express");
const authController = require("../controller/authController");
const favoriteController = require("../controller/favoriteController");

const favoriteRouter = express.Router();

favoriteRouter.get(
  "/",
  authController.protect,
  favoriteController.getFavorites
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

module.exports = favoriteRouter;
