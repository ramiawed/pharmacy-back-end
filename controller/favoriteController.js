const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Favorite = require("../models/favoriteModel");
const User = require("../models/userModel");
const Item = require("../models/itemModel");

// get all favorite for a specific user
exports.getFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  const favorites = await Favorite.findOne({ userId })
    .populate({
      path: "favorites",
      model: "User",
      select: "_id name type allowShowingMedicines",
    })
    .populate({
      path: "favorites_items",
      model: "Item",
      select: "_id name caliber formula",
    })
    .populate({
      path: "favorites_items",
      populate: {
        path: "company",
        model: "User",
        select: "_id name",
      },
    })
    .populate({
      path: "favorites_items",
      populate: {
        path: "warehouses.warehouse",
        model: "User",
      },
    });

  res.status(200).json({
    status: "success",
    count: favorites === null ? 0 : favorites.length,
    data: {
      favorites,
    },
  });
});

exports.getAllFavorites = catchAsync(async (req, res, next) => {
  const favorites = await Favorite.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: favorites,
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
    findFavorites = await Favorite.create({
      userId,
      favorites: [favoriteId],
      favorites_items: [],
    });
  } else if (!findFavorites.favorites.includes(favoriteId)) {
    findFavorites.favorites = [...findFavorites.favorites, favoriteId];
    await findFavorites.save();
  } else {
    return next(new AppError("this favorite is already done"));
  }

  const user = await User.findById(favoriteId);

  res.status(200).json({
    status: "success",
    data: {
      favorite: user,
    },
  });
});

// add favorite item to a user's favorites_item
exports.addFavoriteItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { favoriteItemId } = req.body;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  let findFavorites = await Favorite.findOne({ userId });

  if (!findFavorites || findFavorites.length === 0) {
    findFavorites = await Favorite.create({
      userId,
      favorites: [],
      favorites_items: [favoriteItemId],
    });
  } else if (!findFavorites.favorites_items.includes(favoriteItemId)) {
    findFavorites.favorites_items = [
      ...findFavorites.favorites_items,
      favoriteItemId,
    ];
    await findFavorites.save();
  } else {
    return next(new AppError("this favorite item is already done"));
  }

  const item = await Item.findById(favoriteItemId)
    .populate({
      path: "company",
      model: "User",
      select: "_id name",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city",
    });

  res.status(200).json({
    status: "success",
    data: {
      favorite: item,
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

// delete favorite items from a user's favorites_items
exports.removeFavoriteItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { favoriteItemId } = req.body;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  const findFavorites = await Favorite.findOne({ userId });

  if (!findFavorites || findFavorites.length === 0) {
    return next(new AppError("enter a valid user id", 401));
  }

  if (findFavorites.favorites_items.includes(favoriteItemId)) {
    findFavorites.favorites_items = findFavorites.favorites_items.filter(
      (favoriteItem) => favoriteItem != favoriteItemId
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
      favorite: favoriteItemId,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await Favorite.deleteMany({});

  await Favorite.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
