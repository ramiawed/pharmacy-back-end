const express = require("express");
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const User = require("../models/userModel");
const fs = require("fs");

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
  async (req, res) => {
    const name = req.name;
    const user = req.user;

    try {
      // if the user have a logo, delete it
      if (user.logo_url && user.logo_url !== "") {
        if (fs.existsSync(`${__basedir}/public/profiles/${user.logo_url}`)) {
          fs.unlinkSync(`${__basedir}/public/profiles/${user.logo_url}`);
        }
      }
    } catch (err) {
      console.log(err);
    }

    await User.findByIdAndUpdate(user._id, {
      logo_url: name,
    });

    res.status(200).json({
      status: "success",
      data: {
        name: name,
      },
    });
  }
);

userRouter.post("/upload-paper", upload.single("file"), async (req, res) => {
  const name = req.name;
  const id = req.body.id;
  // try {
  //   // if the user have a logo, delete it
  //   if (user.logo_url && user.logo_url !== "") {
  //     if (fs.existsSync(`${__basedir}/public/profiles/${user.logo_url}`)) {
  //       fs.unlinkSync(`${__basedir}/public/profiles/${user.logo_url}`);
  //     }
  //   }
  // } catch (err) {
  //   console.log(err);
  // }

  // await User.findByIdAndUpdate(user._id, {
  //   logo_url: name,
  // });

  await User.findByIdAndUpdate(id, {
    paper_url: name,
  });

  res.status(200).json({
    status: "success",
    data: {
      name: name,
    },
  });
});

// userRouter.post(
//   "/upload-paper",
//   upload.single("file"),
//   userController.uploadPaper
// );

userRouter.post(
  "/sendemail",
  authController.protect,
  authController.restrictTo("pharmacy"),
  userController.sendEmail
);

module.exports = userRouter;
