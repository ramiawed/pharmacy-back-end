const ItemType = require("../models/itemTypeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const allowedFields = ["name"];

// remove unwanted property from object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// get all the categories
exports.getAllItemTypes = catchAsync(async (req, res, next) => {
  const itemTypes = await ItemType.find({});

  // return the categories
  res.status(200).json({
    length: itemTypes.length,
    data: {
      itemTypes,
    },
  });
});

// add a new item type
exports.addItemType = catchAsync(async (req, res, next) => {
  // remove all fields that doesn't matter
  const filterItemType = filterObj(req.body);

  // create a new category
  const newItemType = await ItemType.create(filterItemType);

  // check if something goes wrong
  if (!newItemType) {
    return next(new AppError("Something went wrong"));
  }

  // return success and the new item type
  res.status(201).json({
    status: "success",
    data: {
      itemType: newItemType,
    },
  });
});

// update a category
exports.updateItemType = catchAsync(async (req, res, next) => {
  // get the itemTypeId from the request paramerters
  const { itemTypeId } = req.params;

  // get the update fields from the request body
  const filterItemType = filterObj(req.body);

  // update the category specified by the categoryId
  const updatedItemType = await Category.findByIdAndUpdate(
    itemTypeId,
    filterItemType,
    {
      new: true,
      runValidators: true,
    }
  );

  // return success and the updated itemType
  res.status(200).json({
    status: "success",
    data: {
      itemType: updatedItemType,
    },
  });
});

// delete a itemType
exports.deleteItemType = catchAsync(async (req, res, next) => {
  // get the itemTypeId from the request parameters
  const { itemTypeId } = req.params;

  await ItemType.findByIdAndDelete(itemTypeId);

  // return success
  res.status(200).json({
    status: "success",
  });
});
