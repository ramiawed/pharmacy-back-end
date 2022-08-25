const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Basket = require("../models/basketModel");
const User = require("../models/userModel");
const Item = require("../models/itemModel");

exports.getBaskets = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { page, limit } = req.query;

  const conditionArray = [];

  conditionArray.push({ isActive: true });

  if (user.type === "warehouse") {
    conditionArray.push({ warehouse: user._id });
  }

  if (user.type === "pharmacy") {
    let filteredWarehouseArray = await User.find({
      type: "warehouse",
      city: user.city,
      isApproved: true,
      isActive: true,
    });

    filteredWarehouseArray.map((w) => w._id);

    conditionArray.push({
      warehouse: { $in: filteredWarehouseArray },
    });
  }

  const baskets = await Basket.find(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  )
    .populate({
      path: "warehouse",
      model: "User",
      select: "_id name city isApproved isActive",
    })
    .populate({
      path: "items.item",
      model: "Item",
      select: "_id name price",
    })
    .sort("-createdAt -name _id")
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1);

  const count = await Basket.countDocuments(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  );

  res.status(200).json({
    status: "success",
    count: count,
    data: {
      baskets,
    },
  });
});

exports.addBasket = catchAsync(async (req, res, next) => {
  const body = req.body;

  const basket = await Basket.create(body);

  const newBasket = await Basket.findById(basket._id)
    .populate({
      path: "warehouse",
      model: "User",
      select: "_id name city isApproved isActive",
    })
    .populate({
      path: "items.item",
      model: "Item",
      select: "_id name price",
    });

  res.status(200).json({
    status: "success",
    data: {
      basket: newBasket,
    },
  });
});

exports.removeBasket = catchAsync(async (req, res, next) => {
  const { basketId } = req.body;

  if (!basketId) {
    return next(new AppError("enter a basket id", 401));
  }

  await Basket.findByIdAndUpdate(basketId, { isActive: false });

  res.status(200).json({
    status: "success",
    data: {
      basketId,
    },
  });
});

exports.updateBasket = catchAsync(async (req, res, next) => {
  const { basketId, data } = req.body;

  const updatedBasket = await Basket.findByIdAndUpdate(basketId, data, {
    new: true,
  })
    .populate({
      path: "warehouse",
      model: "User",
      select: "_id name city isApproved isActive",
    })
    .populate({
      path: "items.item",
      model: "Item",
      select: "_id name price",
    });

  res.status(200).json({
    status: "success",
    data: {
      basket: updatedBasket,
    },
  });
});
