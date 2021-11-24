const express = require("express");
const authController = require("../controller/authController");
const notificationController = require("../controller/notificationController");

const multer = require("multer");

const upload = multer();

const notificationRoutes = express.Router();

notificationRoutes.get(
  "/",
  authController.protect,
  notificationController.getNotifications
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

notificationRoutes.get(
  "/new",
  authController.protect,
  notificationController.getNotificationsAfterNow
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
