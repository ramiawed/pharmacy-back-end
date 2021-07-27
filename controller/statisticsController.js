const User = require("../models/userModel");
const Item = require("../models/itemModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// signin count
exports.incrementSigninCount = catchAsync(async (req, res, next) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, {
    $inc: { signinCount: 1 },
    $push: { signinDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});

// company selected count
exports.incrementSelectedCompany = catchAsync(async (req, res, next) => {
  const { companyId } = req.body;

  await User.findByIdAndUpdate(companyId, {
    $inc: { selectedCount: 1 },
    $push: { selectedDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});

// item selected count
exports.incrementSelectedItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.body;

  await Item.findByIdAndUpdate(itemId, {
    $inc: { selectedCount: 1 },
    $push: { selectedDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});

// item added to cart count
exports.addedToCart = catchAsync(async (req, res, next) => {
  const { itemId } = req.body;

  await Item.findByIdAndUpdate(itemId, {
    $inc: { addedToCartCount: 1 },
    $push: { addedToCartDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});

// order count
exports.incrementOrders = catchAsync(async (req, res, next) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, {
    $inc: { orderCount: 1 },
    $push: { orderDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});

// favorite count
exports.incrementFavorites = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  await User.findByIdAndUpdate(userId, {
    $inc: { addedToFavoriteCount: 1 },
    $push: { addedToFavoriteDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});

// item favorite count
exports.incrementFavoritesItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.body;

  await Item.findByIdAndUpdate(itemId, {
    $inc: { addedToFavoriteCount: 1 },
    $push: { addedToFavoriteDates: Date.now() },
  });

  res.status(200).json({
    status: "success",
  });
});
