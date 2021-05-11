const Category = require("../models/categoryModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const allowedFields = ["name", "logo_url"];

// remove unwanted property from object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// get all the categories
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ inActive: true });

  // return the categories
  res.status(200).json({
    length: categories.length,
    data: {
      categories,
    },
  });
});

// add a category
exports.addCategory = catchAsync(async (req, res, next) => {
  // remove all fields that doesn't matter
  const filterCategory = filterObj(req.body);

  // create a new category
  const newCategory = await Category.create(filterCategory);

  // check if something goes wrong
  if (!newCategory) {
    return next(new AppError("Something went wrong"));
  }

  // return success and the new category
  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

// update a category
exports.updateCategory = catchAsync(async (req, res, next) => {
  // get the categoryId from the request paramerters
  const { categoryId } = req.params;

  // get the update fields from the request body
  const filterCategory = filterObj(req.body);

  // update the category specified by the categoryId
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    filterCategory,
    {
      new: true,
      runValidators: true,
    }
  );

  // return success and the updated category
  res.status(200).json({
    status: "success",
    data: {
      category: updatedCategory,
    },
  });
});

// delete a category
exports.deleteCategory = catchAsync(async (req, res, next) => {
  // get the categoryId from the request parameters
  const { categoryId } = req.params;

  await Category.findByIdAndUpdate(categoryId, { inActive: false });

  // return success
  res.status(200).json({
    status: "success",
  });
});
