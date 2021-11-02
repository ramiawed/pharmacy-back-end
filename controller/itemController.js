const Item = require("../models/itemModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

const itemAllowedFields = [
  "name",
  "company",
  "caliber",
  "formula",
  "indication",
  "composition",
  "packing",
  "price",
  "customer_price",
  "logo_url",
  "isActive",
  "warehouses",
  "inSectionOne",
  "inSectionTwo",
  "inSectionThree",
];

// remove unwanted property from an object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (itemAllowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.getItems = catchAsync(async (req, res, next) => {
  const {
    page,
    limit,
    companyId,
    warehouseId,
    itemName,
    companyName,
    warehouseName,
    isActive,
    inWarehouse,
    outWarehouse,
    sort,
    inSectionOne,
    inSectionTwo,
    inSectionThree,
    city,
  } = req.query;

  let count;
  let items;

  // array that contains all the conditions
  const conditionArray = [];
  if (companyId) {
    conditionArray.push({ company: companyId });
  }

  if (warehouseId) {
    conditionArray.push({ "warehouses.warehouse": warehouseId });
  }

  if (itemName) {
    conditionArray.push({
      $or: [
        { name: { $regex: itemName, $options: "i" } },
        { composition: { $regex: itemName, $options: "i" } },
      ],
    });
  }

  if (inSectionOne !== undefined) {
    conditionArray.push({ inSectionOne: inSectionOne });
  }

  if (inSectionTwo !== undefined) {
    conditionArray.push({ inSectionTwo: inSectionTwo });
  }

  if (inSectionThree !== undefined) {
    conditionArray.push({ inSectionThree: inSectionThree });
  }

  // active condition
  if (isActive !== undefined) {
    conditionArray.push({ isActive: isActive });
  }

  if (companyName) {
    // get the ids for all company that there name match the companyName
    const companiesArray = await User.find({
      name: { $regex: companyName, $options: "i" },
      type: "company",
    });

    // map each company object to it's id
    const arr = companiesArray.map((company) => company._id);

    // get all items that company id in the companies ids array
    conditionArray.push({
      company: { $in: arr },
    });
  }

  if (warehouseName) {
    // get the ids for all warehouse that there name match the warehouseName
    const warehouseArray = await User.find({
      name: { $regex: warehouseName, $options: "i" },
      type: "warehouse",
    });

    // map each warehouse object to it's id
    const arr = warehouseArray.map((warehouse) => warehouse._id);

    // get all items that warehouse id in the companies ids array
    conditionArray.push({
      "warehouses.warehouse": { $in: arr },
    });
  }

  // if (inWarehouse) {
  //   conditionArray.push({ warehouses: { $ne: [] } });
  // }

  // if (outWarehouse) {
  //   conditionArray.push({ warehouses: [] });
  // }

  if (city) {
    let cityCondition = "existing_place." + city;
    if (inWarehouse) {
      conditionArray.push({ [cityCondition]: { $gt: 0 } });
    } else if (outWarehouse) {
      conditionArray.push({ [cityCondition]: { $eq: 0 } });
    }
  } else if (inWarehouse) {
    conditionArray.push({ warehouses: { $ne: [] } });
  } else if (outWarehouse) {
    conditionArray.push({ warehouses: [] });
  }

  count = await Item.countDocuments(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  );

  items = await Item.find(
    conditionArray.length > 0 ? { $and: conditionArray } : {}
  )
    .sort(sort ? sort + " _id" : "createdAt _id")
    .select(
      "_id name caliber formula company warehouses price customer_price logo_url packing isActive existing_place"
    )
    .populate({
      path: "company",
      model: "User",
      select: "_id name",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
      select: "_id name city",
    })
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1);

  res.status(200).json({
    status: "success",
    count,
    data: {
      items,
    },
  });
});

exports.getItemById = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  if (!itemId) {
    return next(new AppError("please provide item id"));
  }

  const item = await Item.findById(itemId)
    .populate({
      path: "company",
    })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    });

  if (!item) {
    return next(new AppError("no such item"));
  }

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

// get items by companyId
exports.getItemsByCompanyId = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;
  const { _id, type } = req.user;

  const query = req.query;

  // array that contains all the conditions
  const conditionArray = [];

  conditionArray.push({ company: req.params.companyId });

  // name condition
  if (query.name) {
    conditionArray.push({ name: { $regex: query.name, $options: "i" } });
  } else {
    delete query.name;
  }

  // in and out warehouse
  if (query.inWarehouse && type === "warehouse") {
    conditionArray.push({ "warehouses.warehouse": _id });
  }

  if (query.inWarehouse && type !== "warehouse") {
    conditionArray.push({ warehouses: { $ne: [] } });
  }

  if (query.outWarehouse && type === "warehouse") {
    conditionArray.push({ "warehouses.warehouse": { $ne: _id } });
  }

  if (query.outWarehouse && type !== "warehouse") {
    conditionArray.push({ warehouses: [] });
  }

  // has an offer
  if (query.hasOffer) {
  }

  if (query.noOffer) {
  }

  // active condition
  conditionArray.push({ isActive: true });

  let count;
  let items;

  if (conditionArray.length === 0) {
    count = await Item.countDocuments();

    items = await Item.find({})
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1)
      .populate({
        path: "warehouses.warehouse",
        model: "User",
      })
      .populate({
        path: "company",
        model: "User",
      });
  } else {
    count = await Item.countDocuments({
      $and: conditionArray,
    });

    items = await Item.find({
      $and: conditionArray,
    })
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1)
      .populate({
        path: "warehouses.warehouse",
        model: "User",
      })
      .populate({
        path: "company",
        model: "User",
      });
  }

  res.status(200).json({
    status: "success",
    count,
    data: {
      items,
    },
  });
});

// get items by warehouseId
exports.getItemsByWarehouseId = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const query = req.query;

  let items;
  let count;

  const conditionArray = [];

  conditionArray.push({ isActive: true });

  conditionArray.push({
    "warehouses.warehouse": req.user._id,
  });

  // search by name
  if (query.name) {
    conditionArray.push({
      name: { $regex: query.name, $options: "i" },
    });
  }

  // search by company name
  if (query.companyName) {
    // get the ids for all company that there name match the companyName
    const companiesArray = await User.find({
      name: { $regex: query.companyName, $options: "i" },
    });

    // map each company object to it's id
    const arr = companiesArray.map((company) => company._id);

    // get all items that company id in the companies ids array
    conditionArray.push({
      company: { $in: arr },
    });
  }

  count = await Item.countDocuments({
    $and: conditionArray,
  });

  items = await Item.find({ $and: conditionArray })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    })
    .sort({ "company.name": -1, _id: 1 })
    .skip((page - 1) * (limit * 1))
    .limit(limit * 1);

  res.status(200).json({
    status: "success",
    count,
    data: {
      items,
    },
  });
});

// add a new item
exports.addItem = catchAsync(async (req, res, next) => {
  // filter the request body
  const filteredItem = filterObj(req.body);

  // create a new item
  const newItem = await Item.create(filteredItem);

  // check if something goes wrong
  if (!newItem) {
    return next(new AppError("Something went wrong"));
  }

  // response with the newly item
  res.status(200).json({
    status: "success",
    data: {
      item: newItem,
    },
  });
});

exports.addAndUpdateItems = catchAsync(async (req, res, next) => {
  const { withUpdate } = req.query;
  const items = req.body;

  if (withUpdate === "addUpdate") {
    // for (let i = 0; i < items.length; ) {
    //   await Item.findOneAndUpdate(
    //     {
    //       name: items[i].name,
    //       caliber: items[i].caliber,
    //       formula: items[i].formula,
    //     },
    //     items[i],
    //     {
    //       new: true,
    //       upsert: true,
    //     },
    //     (error, doc) => {
    //       if (doc) {
    //         i = i + 1;
    //       }
    //     }
    //   );
    for (let i = 0; i < items.length; i++) {
      const item = await Item.findOne({
        name: items[i].name,
        caliber: items[i].caliber,
        formula: items[i].formula,
      });

      if (item) {
        await Item.updateOne(
          {
            name: items[i].name,
            caliber: items[i].caliber,
            formula: items[i].formula,
          },
          items[i]
        );
      } else {
        await Item.create(items[i]);
      }
    }
  } else {
    await Item.insertMany(items);
  }

  // response with the newly item
  res.status(200).json({
    status: "success",
  });
});

// update an item
exports.updateItem = catchAsync(async (req, res, next) => {
  // get itemId from the request parameters
  const { itemId } = req.params;

  // filter the request body
  const filteredItem = filterObj(req.body);

  // update the item and return the new one
  const updatedItem = await Item.findByIdAndUpdate(itemId, filteredItem, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    });

  // response with the updated item
  res.status(200).json({
    status: "success",
    data: {
      item: updatedItem,
    },
  });
});

// change the active state in the item based on the query string
// id the query string if the action property equals to delete
// set the isActive to false otherwise set it to true
exports.changeItemActiveState = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { action } = req.body;

  let item;

  if (action === "delete")
    item = await Item.findByIdAndUpdate(
      itemId,
      { isActive: false },
      { new: true }
    )
      .populate({
        path: "warehouses.warehouse",
        model: "User",
      })
      .populate({
        path: "company",
        model: "User",
      });
  else
    item = await Item.findByIdAndUpdate(
      itemId,
      { isActive: true },
      { new: true }
    )
      .populate({
        path: "warehouses.warehouse",
        model: "User",
      })
      .populate({
        path: "company",
        model: "User",
      });

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

// add item to the warehouse
exports.addItemToWarehouse = catchAsync(async (req, res, next) => {
  // get the item id from request parameters

  const { itemId, city } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = [
    ...findItem.warehouses,
    { warehouse: warehouseId, maxQty: 0 },
  ];

  findItem.existing_place = {
    ...findItem.existing_place,
    [city]: findItem.existing_place[city] + 1,
  };

  await findItem.save();

  const item = await Item.findById(itemId)
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    });

  res.status(200).json({
    status: "success",
    data: {
      item: item,
    },
  });
});

exports.changeItemWarehouseMaxQty = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId, qty } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.map((w) => {
    if (w.warehouse == warehouseId) {
      return { warehouse: warehouseId, offer: w.offer, maxQty: qty };
    } else return w;
  });

  await findItem.save();

  res.status(200).json({
    status: "success",
    data: {
      item: findItem,
    },
  });
});

exports.changeOffer = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId, offer } = req.body;

  // check if the warehouseId exist in the body request
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.map((w) => {
    if (w.warehouse == warehouseId) {
      return { warehouse: warehouseId, offer: offer, maxQty: w.maxQty };
    } else return w;
  });

  await findItem.save();

  const returnedItem = await Item.findById(itemId)
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    });

  res.status(200).json({
    status: "success",
    data: {
      item: returnedItem,
    },
  });
});

//remove item from the warehouse
exports.removeItemFromWarehouse = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId, city } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouseId } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouseId) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  findItem.warehouses = findItem.warehouses.filter((w) => {
    return !w.warehouse.equals(warehouseId);
  });

  findItem.existing_place = {
    ...findItem.existing_place,
    [city]: findItem.existing_place[city] - 1,
  };

  await findItem.save();

  res.status(200).json({
    status: "success",
    data: {
      item: findItem,
    },
  });
});

// change the user logo
exports.uploadImage = catchAsync(async (req, res, next) => {
  const itemId = req.params.itemId;

  const {
    file,
    body: { name },
  } = req;

  const item = await Item.findById(itemId);

  if (!item) {
    return next(new AppError("no such item"));
  }

  // if the user have a logo, delete it
  if (item.logo_url && item.logo_url !== "") {
    if (fs.existsSync(`${__basedir}/public/${item.logo_url}`)) {
      fs.unlinkSync(`${__basedir}/public/${item.logo_url}`);
      await Item.findByIdAndUpdate(itemId, { logo_url: "" });
    }
  }

  await pipeline(
    file.stream,
    fs.createWriteStream(`${__basedir}/public/${name}`)
  );

  const updatedItem = await Item.findByIdAndUpdate(
    itemId,
    { logo_url: name },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      item: updatedItem,
    },
  });
});

exports.changeIsFavoriteField = catchAsync(async (req, res, next) => {
  const { option, id } = req.body;

  const item = await Item.findByIdAndUpdate(
    id,
    { inSectionOne: option },
    { new: true }
  )
    .populate({
      path: "warehouses.warehouse",
      model: "User",
    })
    .populate({
      path: "company",
      model: "User",
    });

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});
