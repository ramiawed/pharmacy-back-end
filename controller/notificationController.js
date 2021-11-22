const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

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

exports.getNotificationsAfterNow = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({
    date: { $gte: Date.now() },
  });

  res.status(200).json({
    status: "success",
    data: {
      notifications,
    },
  });
});

exports.setReadNotification = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { notificationId } = req.query;

  const updatedNotification = await Notification.findById(notificationId);

  updatedNotification.users = [...updatedNotification, _id];

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
  const { file, body } = req;

  if (file) {
    await pipeline(
      file.stream,
      fs.createWriteStream(`${__basedir}/public/${body.logo_url}`)
    );
  }

  const notification = await Notification.create(body);

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
    if (fs.existsSync(`${__basedir}/public/${logo_url}`)) {
      fs.unlinkSync(`${__basedir}/public/${logo_url}`);
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
