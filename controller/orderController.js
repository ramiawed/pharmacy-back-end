const Order = require("../models/orderModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getOrderById = catchAsync(async (req, res, next) => {
  // const user = req.user;
  const { id } = req.query;

  const order = await Order.findById(id)
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1, addressDetails: 1, mobile: 1 },
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

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: orders,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const body = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(id, body, {
    new: true,
  })
    .select(
      "_id pharmacy warehouse seenByAdmin seenByWarehouse warehouseStatus pharmacyStatus"
    )
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1, addressDetails: 1 },
    })
    .populate({
      path: "warehouse",
      model: "User",
      select: { name: 1 },
    });

  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder,
    },
  });
});

exports.updateOrders = catchAsync(async (req, res, next) => {
  const { ids, body } = req.body;

  for (let i = 0; i < ids.length; i++) {
    await Order.findByIdAndUpdate(ids[i], body, {});
  }

  res.status(200).json({
    status: "success",
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
    pharmacyStatus = "",
    warehouseStatus = "",
    adminOrderStatus = "",
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

  if (pharmacyStatus !== "") {
    conditionArray.push({ pharmacyStatus: pharmacyStatus });
  }

  if (warehouseStatus !== "") {
    conditionArray.push({ warehouseStatus: warehouseStatus });
  }

  if (adminOrderStatus !== "") {
    conditionArray.push({
      seenByAdmin: adminOrderStatus === "seen" ? true : false,
    });
  }

  if (date) {
    conditionArray.push({
      createdAt: {
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
    .select(
      "_id pharmacy warehouse orderDate seenByAdmin warehouseStatus pharmacyStatus updatedAt createdAt"
    )
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1, addressDetails: 1 },
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
      warehouseStatus: "unread",
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

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await Order.deleteMany({});

  await Order.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
