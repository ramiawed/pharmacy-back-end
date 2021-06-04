const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Favorite = require("../models/favoriteModel");

// get all favorite for a specific user
exports.getFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  const favorites = await Favorite.findOne({ userId });

  res.status(200).json({
    status: "success",
    count: favorites === null ? 0 : favorites.length,
    data: {
      favorites: favorites ? favorites.favorites : [],
    },
  });
});

// add favorite to a user's favorites
exports.addFavorite = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { favoriteId } = req.body;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  let findFavorites = await Favorite.findOne({ userId });

  if (!findFavorites || findFavorites.length === 0) {
    findFavorites = await Favorite.create({ userId, favorites: [favoriteId] });
  } else if (!findFavorites.favorites.includes(favoriteId)) {
    findFavorites.favorites = [...findFavorites.favorites, favoriteId];
    await findFavorites.save();
  } else {
    return next(new AppError("this favorite is already done"));
  }

  res.status(200).json({
    status: "success",
    data: {
      favorite: favoriteId,
    },
  });
});

// delete favorite from a user's favorites
exports.removeFavorite = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { favoriteId } = req.body;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  const findFavorites = await Favorite.findOne({ userId });

  if (!findFavorites || findFavorites.length === 0) {
    return next(new AppError("enter a valid user id", 401));
  }

  if (findFavorites.favorites.includes(favoriteId)) {
    findFavorites.favorites = findFavorites.favorites.filter(
      (favorite) => favorite != favoriteId
    );
    await findFavorites.save();
  } else {
    return res.status(401).json({
      status: "fail",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      favorite: favoriteId,
    },
  });
});
