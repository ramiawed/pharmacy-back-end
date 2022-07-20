const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const SavedItems = require("../models/savedItemsModel");
const Item = require("../models/itemModel");

exports.getSavedItems = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  const savedItems = await SavedItems.findOne({ userId }).populate([
    {
      path: "items",
      model: "Item",
      select:
        "_id name caliber formula company warehouses price customer_price logo_url packing isActive  composition barcode nameAr",
      populate: {
        path: "warehouses.warehouse company",
        populate: {
          path: "warehouses.warehouse",
          model: "User",
          select: "_id name city isActive isApproved",
        },
        populate: {
          path: "company",
          model: "User",
          select: "_id name",
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      savedItems: savedItems ? savedItems : [],
    },
  });
});

// add item to savedItems
exports.addSavedItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { savedItemId } = req.body;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  let findSavedItems = await SavedItems.findOne({ userId });

  if (!findSavedItems || findSavedItems.length === 0) {
    findSavedItems = await SavedItems.create({
      userId,
      items: [savedItemId],
    });
  } else if (!findSavedItems.items.includes(savedItemId)) {
    findSavedItems.items = [...findSavedItems.items, savedItemId];
    await findSavedItems.save();
  } else {
    return next(new AppError("this item is already in your list"));
  }

  const savedItem = await Item.findById(savedItemId)
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city isActive isApproved",
    })
    .populate({
      path: "company",
      model: "User",
      select: "_id name",
    });

  res.status(200).json({
    status: "success",
    data: {
      savedItem,
    },
  });
});

// delete item from a savedItems
exports.removeSaveItem = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { savedItemId } = req.body;

  if (!userId) {
    return next(new AppError("enter a user id", 401));
  }

  const findSavedItems = await SavedItems.findOne({ userId });

  if (!findSavedItems || findSavedItems.length === 0) {
    return next(new AppError("enter a valid user id", 401));
  }

  if (findSavedItems.items.includes(savedItemId)) {
    findSavedItems.items = findSavedItems.items.filter(
      (item) => item != savedItemId
    );
    await findSavedItems.save();
  } else {
    return res.status(401).json({
      status: "fail",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      item: savedItemId,
    },
  });
});

exports.getAllSavedItems = catchAsync(async (req, res, next) => {
  const savedItems = await SavedItems.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: savedItems,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await SavedItems.deleteMany({});

  await SavedItems.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
