const Order = require("../models/orderModel");
const Item = require("../models/itemModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOrderById = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { id } = req.query;

  let updatedField = {};

  if (user.type === "warehouse") {
    updatedField = {
      seenByWarehouse: true,
    };
  }

  if (user.type === "admin") {
    updatedField = {
      seenByAdmin: true,
    };
  }

  const order = await Order.findByIdAndUpdate(id, updatedField, {
    new: true,
  })
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1 },
    })
    .populate({
      path: "warehouse",
      model: "User",
      select: { name: 1 },
    })
    .populate({
      path: "items.item",
      model: "Item",
      select: { name: 1, formula: 1, caliber: 1, price: 1, customer_price: 1 },
      populate: {
        path: "company",
        model: "User",
        select: { name: 1 },
      },
    });

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.getOrders = catchAsync(async (req, res, next) => {
  const user = req.user;
  const {
    page,
    limit,
    pharmacyName = null,
    warehouseName = null,
    date = null,
    date1 = null,
  } = req.query;

  const conditionArray = [];

  if (user.type === "pharmacy") {
    conditionArray.push({ pharmacy: user._id });
  }

  if (user.type === "warehouse") {
    conditionArray.push({ warehouse: user._id });
  }

  if (pharmacyName) {
    // get the ids for all company that there name match the companyName
    const pharmacies = await User.find(
      {
        name: { $regex: pharmacyName, $options: "i" },
        type: "pharmacy",
      },
      { _id: 1 }
    );

    // map each company object to it's id
    const arr = pharmacies.map((pharmacy) => pharmacy._id);

    // get all items that company id in the companies ids array
    conditionArray.push({
      pharmacy: { $in: arr },
    });
  }

  if (warehouseName) {
    // get the ids for all company that there name match the companyName
    const warehouses = await User.find(
      {
        name: { $regex: warehouseName, $options: "i" },
        type: "warehouse",
      },
      {
        _id: 1,
      }
    );

    // map each company object to it's id
    const arr = warehouses.map((warehouse) => warehouse._id);

    // get all items that company id in the companies ids array
    conditionArray.push({
      warehouse: { $in: arr },
    });
  }

  if (date) {
    conditionArray.push({
      orderDate: {
        $gte: new Date(date),
        $lt: new Date(date1),
      },
    });
  }

  const orders = await Order.find(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  )
    .sort("-createdAt")
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1)
    .select("_id pharmacy warehouse orderDate seenByAdmin seenByWarehouse")
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1 },
    })
    .populate({
      path: "warehouse",
      model: "User",
      select: { name: 1 },
    });

  const count = await Order.countDocuments(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  );

  res.status(200).json({
    status: "success",
    count,
    data: {
      orders,
    },
  });
});

exports.saveOrder = catchAsync(async (req, res, next) => {
  const body = req.body;

  try {
    await Order.create(body);
  } catch (err) {}

  res.status(200).json({
    status: "success",
  });
});

exports.getUnreadOrders = catchAsync(async (req, res, next) => {
  const user = req.user;

  let count = 0;

  if (user.type === "admin") {
    count = await Order.countDocuments({ seenByAdmin: false });
  } else {
    count = await Order.countDocuments({
      seenByWarehouse: false,
      warehouse: user._id,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      count,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  await Order.findByIdAndDelete(orderId);

  res.status(200).json({
    status: "success",
    data: {
      orderId,
    },
  });
});
