const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const { sendPushNotification } = require("../utils/expoNotification");

// get the setting
exports.getNotifications = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const notifications = await Notification.find({})
    .sort("-createdAt")
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1);
  const count = await Notification.countDocuments();

  res.status(200).json({
    status: "success",
    count,
    data: {
      notifications,
    },
  });
});

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: notifications,
    },
  });
});

exports.getNotificationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

exports.setReadNotification = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { notificationId } = req.query;

  const updatedNotification = await Notification.findById(notificationId);

  updatedNotification.users = [...updatedNotification.users, _id];

  await updatedNotification.save();

  res.status(200).json({
    status: "success",
    data: {
      updatedNotification,
    },
  });
});

// add a new notification logo
exports.addNotification = catchAsync(async (req, res, next) => {
  const name = req.name;
  const { title, description } = req.body;

  const notification = await Notification.create({
    header: title,
    body: description,
    logo_url: name,
  });
  const users = await User.find({
    "expoPushToken.0": { $exists: true },
  });

  const somePushTokens = [];
  users.forEach((user) => {
    somePushTokens.push(...user.expoPushToken);
  });

  sendPushNotification(somePushTokens, title, description, {
    screen: "notification",
    notificationId: notification._id,
  });

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  const logo_url = notification.logo_url;

  if (logo_url && logo_url !== "") {
    if (fs.existsSync(`${__basedir}/public/notifications/${logo_url}`)) {
      fs.unlinkSync(`${__basedir}/public/notifications/${logo_url}`);
    }
  }
  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

exports.getUnreadNotifications = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const count = await Notification.countDocuments({ users: { $ne: _id } });

  res.status(200).json({
    status: "success",
    data: {
      count,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await Notification.deleteMany({});

  await Notification.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
