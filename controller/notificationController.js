const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");

// get the setting
exports.getNotifications = catchAsync(async (req, res, next) => {});

// update setting
exports.addNotification = catchAsync(async (req, res, next) => {
  const body = req.body;

  const notification = await Notification.create(body);

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});
