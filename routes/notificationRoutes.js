const express = require("express");
const authController = require("../controller/authController");
const notificationController = require("../controller/notificationController");

// multer configurations
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/notifications");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
    req.name = name;
  },
});
const upload = multer({ storage: storage });

const notificationRoutes = express.Router();

notificationRoutes.get(
  "/",
  authController.protect,
  notificationController.getNotifications
);

notificationRoutes.get(
  "/unread",
  authController.protect,
  notificationController.getUnreadNotifications
);

notificationRoutes.get(
  "/:id",
  authController.protect,
  notificationController.getNotificationById
);

notificationRoutes.post(
  "/setread",
  authController.protect,
  notificationController.setReadNotification
);

notificationRoutes.post(
  "/add",
  upload.single("file"),
  authController.protect,
  authController.restrictTo("admin"),
  notificationController.addNotification
);

notificationRoutes.post(
  "/delete/:id",
  authController.protect,
  authController.restrictTo("admin"),
  notificationController.deleteNotification
);

module.exports = notificationRoutes;
