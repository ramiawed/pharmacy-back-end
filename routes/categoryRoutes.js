const express = require("express");
const authController = require("../controller/authController");
const categoryController = require("../controller/categoryController");

const categoryRoute = express.Router();

categoryRoute
  .route("/")
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo("Admin"),
    categoryController.addCategory
  );

categoryRoute
  .route("/:categoryId")
  .patch(
    authController.protect,
    authController.restrictTo("Admin"),
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo("Admin"),
    categoryController.deleteCategory
  );

module.exports = categoryRoute;
