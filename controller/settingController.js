const Setting = require("../models/settingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// get the setting
exports.getAllSettings = catchAsync(async (req, res, next) => {
  const settings = await Setting.find({});

  res.status(200).json({
    status: "success",
    data: {
      settings,
    },
  });
});

// update setting
exports.updateSetting = catchAsync(async (req, res, next) => {
  const body = req.body;

  const settings = await Setting.findOneAndUpdate({}, body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      settings,
    },
  });
});
