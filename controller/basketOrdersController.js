const BasketOrder = require("../models/basketOrdersModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

const { sendPushNotification } = require("../utils/expoNotification");

exports.getBasketOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  const basketOrder = await BasketOrder.findById(id)
    .populate({
      path: "pharmacy",
      model: "User",
      select: { name: 1, addressDetails: 1, mobile: 1, certificateName: 1 },
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
        select: { name: 1, price: 1 },
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
    const updatedBasketOrder = await BasketOrder.findByIdAndUpdate(
      ids[i],
      body,
      {}
    );

    const { pharmacy, warehouse, createdAt } = updatedBasketOrder;

    const warehouseUser = await User.findById(warehouse).select(
      "name expoPushToken"
    );
    const pharmacyUser = await User.findById(pharmacy).select(
      "name expoPushToken"
    );

    const adminUser = await User.findOne({
      type: "admin",
    }).select("name expoPushToken");

    if (body.warehouseStatus) {
      const orderStatus =
        body.warehouseStatus === "sent"
          ? "طلب السلة قيد الشحن"
          : body.warehouseStatus === "received"
          ? "تم استلام طلب السلة"
          : "نعتذر عن تخديم طلب السلة";
      const message = [
        "تم تغيير حالة طلب السلة المرسلة من الصيدلية",
        `${pharmacyUser.name}`,
        "إلى المستودع",
        `${warehouseUser.name}`,
        "بتاريخ",
        `${new Date(createdAt).toLocaleDateString()}`,
        "إلى",
        `${orderStatus}`,
      ];

      sendPushNotification(
        [...pharmacyUser.expoPushToken, ...adminUser.expoPushToken],
        "تعديل حالة طلب السلة",
        message.join(" "),
        {
          screen: "basket order",
          orderId: updatedBasketOrder._id,
        }
      );
    }

    if (body.pharmacyStatus) {
      const orderStatus =
        body.pharmacyStatus === "sent"
          ? "تم ارسال طلب السلة"
          : "تم استلام طلب السلة من المستودع";
      const message = [
        "تم تغيير حالة طلب السلة المرسلة من الصيدلية",
        `${pharmacyUser.name}`,
        "إلى المستودع",
        `${warehouseUser.name}`,
        "بتاريخ",
        `${new Date(createdAt).toLocaleDateString()}`,
        "إلى",
        `${orderStatus}`,
      ];

      sendPushNotification(
        [...warehouseUser.expoPushToken, ...adminUser.expoPushToken],
        "تعديل حالة طلب السلة",
        message.join(" "),
        {
          screen: "basket order",
          orderId: updatedBasketOrder._id,
        }
      );
    }
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
    orderStatus = "",
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

  if (orderStatus !== "") {
    conditionArray.push({ status: orderStatus });
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
  const { warehouse, basket } = req.body;
  const pharmacyId = req.user._id;

  if (!warehouse || !basket) {
    return next(
      new AppError("please choose a warehouse and/or basket to add", 400)
    );
  }

  await BasketOrder.create(req.body);

  // to send notification for a warehouse
  const warehouserUser = await User.findById(warehouse);
  const pharmacyUser = await User.findById(pharmacyId).select("_id name");
  const adminUser = await User.findOne({
    type: "admin",
  });

  const messages = ["طلب سلة جديدة من الصيدلية", `${pharmacyUser.name}`, ""];

  if (warehouserUser && warehouserUser.expoPushToken.length > 0) {
    const somePushTokens = [];
    somePushTokens.push(...warehouserUser.expoPushToken);
    sendPushNotification(somePushTokens, "طلبية سلة جديدة", messages.join(" "));
  }

  if (
    adminUser &&
    adminUser.expoPushToken &&
    adminUser.expoPushToken.length > 0
  ) {
    messages.push("الى المستودع", `${warehouserUser.name}`);
    sendPushNotification(
      adminUser.expoPushToken,
      "طلبية سلة جديدة",
      messages.join(" ")
    );
  }

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
  const { data, rest } = req.body;

  const modifiedData = data.map((d) => {
    return {
      ...d,
      _id: mongoose.Types.ObjectId(d._id),
      pharmacy: mongoose.Types.ObjectId(d.pharmacy),
      warehouse: mongoose.Types.ObjectId(d.warehouse),
      basket: mongoose.Types.ObjectId(d.basket),
    };
  });

  try {
    if (rest) {
      await BasketOrder.deleteMany({});
      await BasketOrder.insertMany(modifiedData);
    } else {
      await BasketOrder.insertMany(modifiedData);
    }
  } catch (err) {
    return next(new AppError("error occured during restore some data", 401));
  }

  res.status(200).json({
    status: "success",
  });
});
