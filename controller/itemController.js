const Item = require("../models/itemModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

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
  const { page, limit } = req.query;

  const query = req.query;

  // array that contains all the conditions
  const conditionArray = [];

  conditionArray.push({ company: req.user._id });

  // name condition
  if (query.name) {
    conditionArray.push({ name: { $regex: query.name, $options: "i" } });
  } else {
    delete query.name;
  }

  // active condition
  if (query.isActive !== undefined) {
    conditionArray.push({ isActive: query.isActive });
  }

  let count;
  let items;

  if (conditionArray.length === 0) {
    count = await Item.countDocuments();

    items = await Item.find()
      .sort(query.sort ? query.sort : "-createdAt -name")
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1);
  } else {
    count = await Item.countDocuments({
      $and: conditionArray,
    });

    items = await Item.find({
      $and: conditionArray,
    })
      .sort(query.sort ? query.sort : "-createdAt -name")
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1);
  }

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

exports.addItems = catchAsync(async (req, res, next) => {
  const items = await Item.insertMany(req.body);

  if (!items) {
    return next(new AppError("Something went wrong"));
  }

  // response with the newly item
  res.status(200).json({
    status: "success",
    data: {
      items,
    },
  });
});

// update an item
exports.updateItem = catchAsync(async (req, res, next) => {
  // get itemId from the request parameters
  const { itemId } = req.params;

  // filter the request body
  const filteredItem = filterObj(req.body);

  // remove the caliber field
  delete filteredItem["caliber"];

  // update the item and return the new one
  const updatedItem = await Item.findByIdAndUpdate(itemId, filteredItem, {
    new: true,
    runValidators: true,
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
    );
  else
    item = await Item.findByIdAndUpdate(
      itemId,
      { isActive: true },
      { new: true }
    );

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

// add item to the warehouse
// supply the itemId and warehouse, caliber
exports.addItemToWarehouse = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouse, caliber } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouse || !caliber) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  const findItemWithCaliber = findItem.caliber.find(
    (el) => el.value === caliber
  );

  findItemWithCaliber.warehouse.push({ warehouse_id: warehouse });

  await findItem.save();

  res.status(200).json({
    status: "success",
  });
});

//remove item from the warehouse
// supply the itemId and warehouse, caliber
exports.removeItemFromWarehouse = catchAsync(async (req, res, next) => {
  // get the item id from request parameters
  const { itemId } = req.params;

  // get the warehouseId and caliber from request body
  const { warehouse, caliber } = req.body;

  // check if the warehouse and caliber fields exist in the request body
  if (!warehouse || !caliber) {
    return next(new AppError(`Please provide the required fields`));
  }

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  // if the item doesn't exist
  if (!findItem) {
    return next(new AppError(`No item found`, 400));
  }

  const findItemWithCaliber = findItem.caliber.find(
    (el) => el.value === caliber
  );

  // check if the caliber exist in the item
  if (!findItemWithCaliber) {
    return next(new AppError(`No caliber found in this item`, 400));
  }

  // remove the warehouse from caliber array
  findItemWithCaliber.warehouse = findItemWithCaliber.warehouse.filter((wh) => {
    return wh.warehouse_id == warehouse;
  });

  await findItem.save();

  res.status(200).json({
    status: "success",
  });
});
