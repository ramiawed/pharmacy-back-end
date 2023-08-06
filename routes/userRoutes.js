const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");

// multer configurations
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profiles");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
    req.name = name;
  },
});

const upload = multer({ storage: storage });

const licenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/licenses");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
    req.name = name;
  },
});

const licenseUpload = multer({ storage: licenseStorage });

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.post("/signin", authController.signin);
userRouter.post("/signinwithtoken", authController.signinWithToken);
userRouter.get("/me", authController.protect, userController.getMyDetails);
userRouter.get(
  "/all",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAllUsers
);
userRouter.get("/check-username/:username", authController.checkUsername);
userRouter.get("/check-version/:version", authController.checkVersion);
userRouter.post(
  "/restore",
  authController.protect,
  authController.restrictTo("admin"),
  userController.restoreData
);
userRouter.post(
  "/store-expo-push-token",
  authController.protect,
  userController.storeExpoPushToken
);
userRouter.post(
  "/clear-expo-push-token",
  authController.protect,
  userController.clearExpoPushToken
);

userRouter.post("/updateMe", authController.protect, userController.updateMe);
userRouter.post(
  "/update/:userId?",
  authController.protect,
  // authController.restrictTo("admin"),
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

userRouter.get(
  "/my-points",
  authController.protect,
  authController.restrictTo("pharmacy"),
  userController.getMyPoints
);

userRouter.post(
  "/add-company-to-ours",
  authController.protect,
  userController.addCompanyToOurCompanies
);
userRouter.post(
  "/remove-company-from-ours",
  authController.protect,
  userController.removeCompanyFromOurCompanies
);

userRouter.post(
  "/delete-user/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteUser
);

userRouter.post("/deleteMe", authController.protect, userController.deleteMe);

userRouter.get("/", authController.protect, userController.getUsers);
userRouter.get(
  "/companies",
  authController.protect,
  userController.getCompanies
);
userRouter.get(
  "/warehouses",
  authController.protect,
  userController.getWarehouses
);
userRouter.get("/:userId", authController.protect, userController.getUserById);

userRouter.post(
  "/upload",
  upload.single("file"),
  authController.protect,
  userController.uploadProfilePicture
);

userRouter.post(
  "/upload-license",
  licenseUpload.single("file"),
  userController.uploadLicense
);

userRouter.post(
  "/sendemail",
  authController.protect,
  authController.restrictTo("pharmacy"),
  userController.sendEmail
);

userRouter.post(
  "/delete-image",
  authController.protect,
  userController.removeImage
);

userRouter.post(
  "/update-points",
  authController.protect,
  userController.updatePoints
);

module.exports = userRouter;
