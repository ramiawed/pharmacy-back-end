const Item = require("../models/itemModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const itemAllowedFields = [
  "name",
  "trade_name",
  "caliber",
  "price",
  "logo_url",
  "description",
  "pharmacological_composition",
  "type",
  "tags",
  "category",
  "company",
  "isActive",
];

// remove unwanted property from an object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (itemAllowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

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
  const { action } = req.query;

  if (action === "delete")
    await Item.findByIdAndUpdate(itemId, { isActive: false });
  else await Item.findByIdAndUpdate(itemId, { isActive: true });

  res.status(200).json({
    status: "success",
  });
});

// Add a new value or update an existing value
// based on the query parameters (action field)
// action === new, add a new value
// action === update, update an existing value.
exports.handleCaliber = catchAsync(async (req, res, next) => {
  // get the item id from the request parameters
  const { itemId } = req.params;

  const { action } = req.query;

  // get the caliber value from the request body
  const { oldValue, newValue } = req.body;

  // find the item specified by itemId
  const findItem = await Item.findById(itemId);

  if (action === "new") {
    // add a new caliber
    // add the new value to the caliber array
    findItem.caliber.push({ value: newValue });

    // save the change
    await findItem.save();
  } else if (action === "update") {
    // update an existing caliber
    const findCaliber = findItem.caliber.find((el) => el.value === oldValue);

    // check if the findCaliber exist
    if (!findCaliber) {
      return next(new AppError(`You can't find this caliber`));
    }

    // if this caliber exists in any warehouse you can update it
    if (findCaliber.warehouse.length !== 0) {
      return next(new AppError(`You can't update this caliber`), 400);
    }

    // update  the value
    findCaliber.value = newValue;

    // save the change
    await findItem.save();
  }

  // send the response
  res.status(200).json({
    status: "success",
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

  console.log(findItemWithCaliber.warehouse);

  findItemWithCaliber.warehouse = findItemWithCaliber.warehouse.filter((wh) => {
    console.log(wh.warehouse_id, warehouse);
    return wh.warehouse_id == warehouse;
  });

  console.log(findItemWithCaliber.warehouse);

  await findItem.save();

  res.status(200).json({
    status: "success",
  });
});
