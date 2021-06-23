const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/signin", authController.signin);

userRouter.post("/updateMe", authController.protect, userController.updateMe);
userRouter.post(
  "/changeMyPassword",
  authController.protect,
  userController.changeMyPassword
);
userRouter.post("/deleteMe", authController.protect, userController.deleteMe);

userRouter.post(
  "/approve/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  userController.changeApprovedState
);
userRouter.post(
  "/delete/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);
userRouter.post(
  "/reactivate/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  userController.reactivateUser
);

userRouter.get(
  "/",
  authController.protect,
  // authController.restrictTo("admin"),
  userController.getUsers
);

userRouter.get("/:userId", authController.protect, userController.getUserById);

module.exports = userRouter;
