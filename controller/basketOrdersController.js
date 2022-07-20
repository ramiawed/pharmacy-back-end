const BasketOrder = require("../models/basketOrdersModel");
const Basket = require("../models/basketModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getBasketOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  const basketOrder = await BasketOrder.findById(id)
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1, addressDetails: 1 },
    })
    .populate({
      path: "warehouse",
      model: "User",
      select: { name: 1 },
    })
    .populate({
      path: "basket",
      model: "Basket",
      populate: {
        path: "items.item",
        model: "Item",
      },
    });

  res.status(200).json({
    status: "success",
    data: {
      basketOrder,
    },
  });
});

exports.getAllBasketOrders = catchAsync(async (req, res, next) => {
  const basketOrders = await BasketOrder.find({});

  res.status(200).json({
    status: "success",
    data: {
      data: basketOrders,
    },
  });
});

exports.updateBasketOrder = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const body = req.body;

  const updateBasketOrder = await BasketOrder.findByIdAndUpdate(id, body, {
    new: true,
  })
    .select(
      "_id pharmacy warehouse seenByAdmin seenByWarehouse warehouseStatus pharmacyStatus createdAt"
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
      basketOrder: updateBasketOrder,
    },
  });
});

exports.updateBasketOrders = catchAsync(async (req, res, next) => {
  const { ids, body } = req.body;

  for (let i = 0; i < ids.length; i++) {
    await BasketOrder.findByIdAndUpdate(ids[i], body, {});
  }

  res.status(200).json({
    status: "success",
  });
});

exports.getBasketOrders = catchAsync(async (req, res, next) => {
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

  const basketOrders = await BasketOrder.find(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  )
    .sort("-createdAt")
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1)
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1, addressDetails: 1 },
    })
    .populate({
      path: "warehouse",
      model: "User",
      select: { name: 1 },
    })
    .populate({
      path: "basket",
      model: "Basket",
      populate: {
        path: "items.item",
        model: "Item",
      },
    });

  const count = await BasketOrder.countDocuments(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  );

  res.status(200).json({
    status: "success",
    count,
    data: {
      basketOrders,
    },
  });
});

exports.addBasketOrder = catchAsync(async (req, res, next) => {
  const { warehouseId, basketId } = req.body;
  const pharmacyId = req.user._id;

  if (!warehouseId || !basketId) {
    return next(
      new AppError("please choose a warehouse and/or basket to add", 400)
    );
  }

  await BasketOrder.create({
    pharmacy: pharmacyId,
    warehouse: warehouseId,
    basket: basketId,
  });

  res.status(200).json({
    status: "success",
  });
});

exports.getUnreadBasketOrders = catchAsync(async (req, res, next) => {
  const user = req.user;

  let count = 0;

  if (user.type === "admin") {
    count = await BasketOrder.countDocuments({ seenByAdmin: false });
  } else {
    count = await BasketOrder.countDocuments({
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

exports.deleteBasketOrder = catchAsync(async (req, res, next) => {
  const { basketOrderId } = req.body;

  await BasketOrder.findByIdAndDelete(basketOrderId);

  res.status(200).json({
    status: "success",
    data: {
      basketOrderId,
    },
  });
});

exports.restoreData = catchAsync(async (req, res, next) => {
  const body = req.body;

  await BasketOrder.deleteMany({});

  await BasketOrder.insertMany(body);

  res.status(200).json({
    status: "success",
  });
});
