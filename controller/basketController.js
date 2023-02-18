const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Basket = require("../models/basketModel");
const User = require("../models/userModel");
const Item = require("../models/itemModel");
const mongoose = require("mongoose");

exports.getBaskets = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { page, limit, searchWarehouseIds } = req.query;

  const conditionArray = [];

  conditionArray.push({ isActive: true });

  if (user.type === "warehouse") {
    conditionArray.push({ warehouse: user._id });
  }

  if (user.type === "pharmacy") {
    let filteredWarehouseArray = await User.find({
      type: "warehouse",
      city: user.city,
      isActive: true,
    });

    filteredWarehouseArray.map((w) => w._id);

    conditionArray.push({
      warehouse: { $in: filteredWarehouseArray },
    });
  }

  if (searchWarehouseIds && searchWarehouseIds.length > 0) {
    conditionArray.push({
      warehouse: { $in: searchWarehouseIds },
    });
  }

  const baskets = await Basket.find(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  )
    .populate({
      path: "warehouse",
      model: "User",
      select: "_id name city isActive",
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
      select: "_id name city isActive",
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
      select: "_id name city  isActive",
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

exports.getAllBaskets = catchAsync(async (req, res, next) => {
  const baskets = await Basket.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: baskets,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const { data, rest } = req.body;

  const modifiedData = data.map((d) => {
    return {
      ...d,
      _id: mongoose.Types.ObjectId(d._id),
      warehouse: mongoose.Types.ObjectId(d.warehouse),
      items: d.items.map((i) => {
        return {
          ...i,
          item: mongoose.Types.ObjectId(i.item),
          _id: mongoose.Types.ObjectId(d._id),
        };
      }),
    };
  });

  try {
    if (rest) {
      await Basket.deleteMany({});
      await Basket.insertMany(modifiedData);
    } else {
      await Basket.insertMany(modifiedData);
    }
  } catch (err) {
    return next(new AppError("error occured during restore some data", 401));
  }

  res.status(200).json({
    status: "success",
  });
});
