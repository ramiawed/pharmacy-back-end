const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");

const multer = require("multer");
const upload = multer({ dest: "./public/profiles/" });

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/signin", authController.signin);
userRouter.post("/signinwithtoken", authController.signinWithToken);
userRouter.get("/me", authController.protect, userController.getMyDetails);

userRouter.post("/updateMe", authController.protect, userController.updateMe);
userRouter.post(
  "/update/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  userController.update
);
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

userRouter.get("/", authController.protect, userController.getUsers);

userRouter.get("/:userId", authController.protect, userController.getUserById);

userRouter.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  userController.uploadImage
);

userRouter.post(
  "/upload-paper",
  upload.single("file"),
  userController.uploadPaper
);

userRouter.post(
  "/sendemail",
  authController.protect,
  authController.restrictTo("pharmacy"),
  userController.sendEmail
);

module.exports = userRouter;
