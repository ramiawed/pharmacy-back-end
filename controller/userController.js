const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const userAllowedFields = ["logo_url", "mobile", "email", "address", "type"];

// remove unwanted property from an object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (userAllowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// update some fields in user profile
// 1- pass the protect middleware
// 2- get id = req.user.id after passing the protect middleware
// 3- update the info and return the new user
exports.updateMe = catchAsync(async (req, res, next) => {
  const newObj = filterObj(req.body);

  // get the user id from the req.user after passing protect middleware
  const userId = req.user._id;

  const updatedUser = await User.findByIdAndUpdate(userId, newObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// delete a user by setting the isActive to false
// 1- need to pass protect middleware
// 2- get the id from the req.user.id after passing protect middleware
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(200).json({
    status: "success",
  });
});

// change approve property based on the query string
// if action is enable, set the approve to true
// if action is disable, set the approve to false
exports.changeApprovedState = catchAsync(async (req, res, next) => {
  // get the action from the request body
  // action may be enable, or disable
  const { action } = req.body;

  if (action === "enable") {
    console.log("enter enable");
    // set the isApproved property to true for a specific user
    await User.findByIdAndUpdate(req.params.userId, { isApproved: true });
  } else if (action === "disable") {
    // set the isApproved property to false for a specific user
    await User.findByIdAndUpdate(req.params.userId, { isApproved: false });
  }

  res.status(200).json({
    status: action === "enable" ? "activation success" : "deactivation success",
  });
});

// delete a user by admin
// get userId from request url parameters
exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.userId, {
    isActive: false,
    isApproved: false,
  });

  res.status(200).json({
    status: "delete success",
  });
});

// re activate deleted user
// get userId from request url parameters
exports.reactivateUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.userId, { isActive: true });

  res.status(200).json({
    status: "undo delete success",
  });
});

// get users specified by type (Company, Warehouse, Normal, Admin)
exports.getUsers = catchAsync(async (req, res, next) => {
  const { page, name } = req.query;

  const query = req.query;

  // array that contains all the conditions
  const conditionArray = [];
  if (query.type) {
    conditionArray.push({ type: query.type });
  }

  // name condition
  if (query.name) {
    conditionArray.push({ name: { $regex: query.name, $options: "i" } });
  } else {
    delete query.name;
  }

  // approve condition
  if (query.isApproved !== undefined) {
    conditionArray.push({ isApproved: query.isApproved });
  }

  // active condition
  if (query.isActive !== undefined) {
    conditionArray.push({ isActive: query.isActive });
  }

  let count;
  let users;

  if (conditionArray.length === 0) {
    count = await User.countDocuments();

    users = await User.find()
      .skip((page - 1) * 4)
      .limit(4);
  } else {
    count = await User.countDocuments({
      $and: conditionArray,
    });

    users = await User.find({
      $and: conditionArray,
    })
      .skip((page - 1) * 4)
      .limit(4);
  }
  // [query.type, { name: { $regex: name, $options: "i" } }]

  res.status(200).json({
    status: "success",
    count,
    data: {
      users,
    },
  });
});
