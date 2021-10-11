const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const Excel = require("exceljs");
const nodemailer = require("nodemailer");

const userAllowedFields = [
  "name",
  "username",
  "logo_url",
  "phone",
  "mobile",
  "email",
  "type",
  "city",
  "district",
  "street",
  "employeeName",
  "certificateName",
  "allowAdmin",
  "signinCount",
  "selectedCount",
  "orderCount",
  "favoriteCount",
  "inSectionOne",
  "inSectionTwo",
];

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
  // 1- check if password in the body
  const { password } = req.body;

  const findUser = await User.findById(req.user._id).select("+password");

  // 2- check that the password is correct
  const result = await findUser.correctPassword(password, findUser.password);

  if (!result) {
    return next(new AppError("password is wrong", 401));
  }

  // findUser.isApproved = false;
  // findUser.isActive = false;

  await User.findByIdAndUpdate(
    req.user._id,
    { isActive: false, isApproved: false },
    { runValidators: false }
  );

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

  console.log("approve");

  let user;

  if (action === "enable") {
    // set the isApproved property to true for a specific user
    user = await User.findByIdAndUpdate(
      req.params.userId,
      { isApproved: true },
      { new: true }
    );
  } else if (action === "disable") {
    // set the isApproved property to false for a specific user
    user = await User.findByIdAndUpdate(
      req.params.userId,
      { isApproved: false },
      { new: true }
    );
  }

  res.status(200).json({
    status: action === "enable" ? "activation success" : "deactivation success",
    data: {
      user,
    },
  });
});

// delete a user by admin
// get userId from request url parameters
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      isActive: false,
      isApproved: false,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "delete success",
    data: {
      user,
    },
  });
});

// re activate deleted user
// get userId from request url parameters
exports.reactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isActive: true },
    { new: true }
  );

  res.status(200).json({
    status: "undo delete success",
    data: {
      user,
    },
  });
});

// update the isFavorite field for specific company
exports.changeInSectionOne = catchAsync(async (req, res, next) => {
  const { option } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { inSectionOne: option },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// update the isNewest field for specific company
exports.changeInSectionTwo = catchAsync(async (req, res, next) => {
  const { option } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { inSectionTwo: option },
    { new: true }
  );

  res.status(200).json({
    status: "added successfully",
    data: {
      user,
    },
  });
});

// exports.getNewestCompanies = catchAsync(async (req, res, next) => {
//   const newestCompanies = await User.find({ isNewest: true });

//   res.status(200).json({
//     status: "success",
//     data: {
//       newestCompanies,
//     },
//   });
// });

exports.getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// get users specified by type (Company, Warehouse, Normal, Admin)
exports.getUsers = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

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

  if (query.inSectionOne !== undefined) {
    conditionArray.push({ inSectionOne: query.inSectionOne });
  }

  if (query.inSectionTwo !== undefined) {
    conditionArray.push({ inSectionTwo: query.inSectionTwo });
  }

  // approve condition
  if (query.isApproved !== undefined) {
    conditionArray.push({ isApproved: query.isApproved });
  }

  // active condition
  if (query.isActive !== undefined) {
    conditionArray.push({ isActive: query.isActive });
  }

  // city
  if (query.city) {
    conditionArray.push({ city: { $regex: query.city, $options: "i" } });
  } else {
    delete query.city;
  }

  // district
  if (query.district) {
    conditionArray.push({
      district: { $regex: query.district, $options: "i" },
    });
  } else {
    delete query.district;
  }

  // street
  if (query.street) {
    conditionArray.push({
      street: { $regex: query.street, $options: "i" },
    });
  } else {
    delete query.street;
  }

  // employee name
  if (query.employeeName) {
    conditionArray.push({
      employeeName: { $regex: query.employeeName, $options: "i" },
    });
  } else {
    delete query.employeeName;
  }

  // certificate name
  if (query.certificateName) {
    conditionArray.push({
      certificateName: { $regex: query.certificateName, $options: "i" },
    });
  } else {
    delete query.certificateName;
  }

  // job
  if (query.job) {
    conditionArray.push({
      "guestDetails.job": query.job,
    });
  } else {
    delete query.job;
  }

  // company name
  if (query.companyName) {
    conditionArray.push({
      "guestDetails.companyName": { $regex: query.companyName, $options: "i" },
    });
  } else {
    delete query.companyName;
  }

  // job title
  if (query.jobTitle) {
    conditionArray.push({
      "guestDetails.jobTitle": { $regex: query.jobTitle, $options: "i" },
    });
  } else {
    delete query.jobTitle;
  }

  let count;
  let users;

  if (conditionArray.length === 0) {
    count = await User.countDocuments();

    users = await User.find()
      .sort(query.sort ? query.sort + " _id" : "-createdAt -name _id")
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1);
  } else {
    count = await User.countDocuments({
      $and: conditionArray,
    });

    users = await User.find({
      $and: conditionArray,
    })
      .sort(query.sort ? query.sort : "-createdAt -name ")
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1);
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

// change my password
exports.changeMyPassword = catchAsync(async (req, res, next) => {
  // 1- check if the old password and the new password in the body
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  const updateUser = await User.findById(req.user._id).select("+password");

  // 2- check that the old password is correct
  const result = await updateUser.correctPassword(
    oldPassword,
    updateUser.password
  );

  if (!result) {
    return next(new AppError("Old password is wrong", 401));
  }

  // 3- change the password and save the user
  updateUser.password = newPassword;
  updateUser.passwordConfirm = newPasswordConfirm;

  await updateUser.save({});

  // 4- return succeeded
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

// reset user password
exports.resetUserPassword = catchAsync(async (req, res, next) => {
  const { userId, newPassword, newPasswordConfirm } = req.body;

  const updateUser = await User.findById(userId).select("+password");

  updateUser.password = newPassword;
  updateUser.passwordConfirm = newPasswordConfirm;

  await updateUser.save({});

  // 4- return succeeded
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

// change the user logo
exports.uploadImage = catchAsync(async (req, res, next) => {
  const { logo_url, _id } = req.user;
  const {
    file,
    body: { name },
  } = req;

  // if the user have a logo, delete it
  if (logo_url && logo_url !== "") {
    if (fs.existsSync(`${__basedir}/public/${logo_url}`)) {
      fs.unlinkSync(`${__basedir}/public/${logo_url}`);
      await User.findByIdAndUpdate(_id, { logo_url: "" });
    }
  }

  await pipeline(
    file.stream,
    fs.createWriteStream(`${__basedir}/public/${name}`)
  );

  const updateUser = await User.findByIdAndUpdate(
    _id,
    { logo_url: name },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

// send email
exports.sendEmail = catchAsync(async (req, res, next) => {
  const user = req.user;

  const { cartItems = [] } = req.body;

  console.log(cartItems);

  const filename = `Order ${Date.now()}.xlsx`;
  let workbook = new Excel.Workbook();
  let worksheet = workbook.addWorksheet("Debtors");

  worksheet.columns = [
    { header: "الاسم التجاري", key: "itemName" },
    { header: "اسم الشركة", key: "companyName" },
    { header: "المستودع", key: "warehouseName" },
    { header: "الشكل الصيدلاني", key: "formula" },
    { header: "العيار", key: "caliber" },
    { header: "التعبئة", key: "packing" },
    { header: "السعر ص", key: "price" },
    { header: "السعر ع", key: "customerPrice" },
    { header: "الكمية", key: "quantity" },
    { header: "بونص", key: "bonus" },
    { header: "السعر الإجمالي", key: "totalPrice" },
  ];

  cartItems.forEach((e) => {
    worksheet.addRow(e);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "companypharmalinkclient@gmail.com",
      pass: "C@mpany(2021)",
    },
  });

  const mailOptions = {
    from: "companypharmalinkclinent@gmail.com",
    to: "companypharmalink@gmail.com",
    subject: "subject",
    html: `<p><label>name:</label> <label><b>${user.name}</b></label></p>
           <p><label>Phone:</label> <label><b>${user.phone[0]}</b></label></p>
           <p><label>Email:</label> <label><b>${user.email[0]}</b></label></p>
           <p><label>Date:</label> <label><b>${new Date()}</b></label></p>
    `,
    attachments: [
      {
        filename,
        content: buffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };

  // transporter.verify().then(console.log).catch(console.error);

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    status: "success",
  });
});
