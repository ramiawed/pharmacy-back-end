const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/signin", authController.signin);

userRouter.patch("/updateMe", authController.protect, userController.updateMe);
userRouter.delete("/deleteMe", authController.protect, userController.deleteMe);
userRouter.post(
  "/approve/:userId",
  authController.protect,
  authController.restrictTo("Admin"),
  userController.changeApprovedState
);
userRouter.post(
  "/delete/:userId",
  authController.protect,
  authController.restrictTo("Admin"),
  userController.deleteUser
);
userRouter.post(
  "/reactivate/:userId",
  authController.protect,
  authController.restrictTo("Admin"),
  userController.reactivateUser
);

userRouter.get(
  "/",
  authController.protect,
  authController.restrictTo("Admin"),
  userController.getUsers
);

module.exports = userRouter;
