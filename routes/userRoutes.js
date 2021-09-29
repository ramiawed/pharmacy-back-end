const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const multer = require("multer");

const upload = multer();

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/signin", authController.signin);

userRouter.post("/updateMe", authController.protect, userController.updateMe);
userRouter.post(
  "/changeMyPassword",
  authController.protect,
  userController.changeMyPassword
);

userRouter.post(
  "/resetUserPassword",
  authController.protect,
  authController.restrictTo("admin"),
  userController.resetUserPassword
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

userRouter.post(
  "/isFavorite/:userId?",
  authController.protect,
  authController.restrictTo("admin"),
  userController.changeIsFavoriteField
);

userRouter.post(
  "/isNewest/:userId?",
  authController.protect,
  authController.restrictTo("admin"),
  userController.changeIsNewestField
);

userRouter.get("/", authController.protect, userController.getUsers);

userRouter.get("/:userId", authController.protect, userController.getUserById);

userRouter.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  userController.uploadImage
);

userRouter.post(
  "/sendemail",
  authController.protect,
  authController.restrictTo("pharmacy"),
  userController.sendEmail
);

module.exports = userRouter;
