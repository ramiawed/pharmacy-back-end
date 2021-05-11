const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/signin", authController.signin);

userRouter.patch("/updateMe", authController.protect, userController.updateMe);
userRouter.delete("/deleteMe", authController.protect, userController.deleteMe);
userRouter.post(
  "/approve/enable/:userId",
  authController.protect,
  authController.restrictTo("Admin"),
  userController.enableApproved
);
userRouter.post(
  "/approve/disable/:userId",
  authController.protect,
  authController.restrictTo("Admin"),
  userController.disableApproved
);
userRouter.delete(
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

userRouter.get("/", userController.getAllUsers);

module.exports = userRouter;
