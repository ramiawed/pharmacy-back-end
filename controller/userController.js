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
  "addressDetails",
  "employeeName",
  "certificateName",
  "allowAdmin",
  "inSectionOne",
  "inSectionTwo",
  "details",
  "allowShowingMedicines",
  "paper_url",
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

  await User.findByIdAndUpdate(
    req.user._id,
    { isActive: false, isApproved: false },
    { runValidators: false }
  );

  res.status(200).json({
    status: "success",
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const body = req.body;

  const user = await User.findByIdAndUpdate(userId, body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// get a user by id
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

  const details = query.details;

  // array that contains all the conditions
  const conditionArray = [];
  if (query.type) {
    conditionArray.push({ type: query.type });
  }

  // name condition
  if (query.name) {
    conditionArray.push({ name: { $regex: query.name, $options: "i" } });
  }

  // inSectionOne condition
  if (query.inSectionOne !== undefined) {
    conditionArray.push({ inSectionOne: query.inSectionOne });
  }

  // inSectionTwo condition
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

  //
  if (query.allowShowingMedicines !== undefined) {
    conditionArray.push({ allowShowingMedicines: query.allowShowingMedicines });
  }

  // city condition
  if (query.city) {
    conditionArray.push({ city: query.city });
  }

  // address details
  if (query.addressDetails) {
    conditionArray.push({
      addressDetails: { $regex: query.addressDetails, $options: "i" },
    });
  }

  // employee name
  if (query.employeeName) {
    conditionArray.push({
      employeeName: { $regex: query.employeeName, $options: "i" },
    });
  }

  // certificate name
  if (query.certificateName) {
    conditionArray.push({
      certificateName: { $regex: query.certificateName, $options: "i" },
    });
  }

  // job
  if (query.job) {
    conditionArray.push({
      "guestDetails.job": query.job,
    });
  }

  // company name
  if (query.companyName) {
    conditionArray.push({
      "guestDetails.companyName": { $regex: query.companyName, $options: "i" },
    });
  }

  // job title
  if (query.jobTitle) {
    conditionArray.push({
      "guestDetails.jobTitle": { $regex: query.jobTitle, $options: "i" },
    });
  }

  let count;
  let users;

  if (conditionArray.length === 0) {
    count = await User.countDocuments();

    users = await User.find()
      .select(
        details === "all"
          ? "-inSectionOne -inSectionTwo"
          : "name  logo_url  _id city type allowShowingMedicines"
      )
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
      .select(
        details === "all"
          ? "-inSectionOne -inSectionTwo"
          : "name  logo_url  _id city type allowShowingMedicines"
      )
      .skip((page - 1) * (limit * 1))
      .limit(limit * 1);
  }

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
  });
});

// get info for a user defined by id
exports.getMyDetails = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.uploadProfilePicture = catchAsync(async (req, res) => {
  const name = req.name;
  const user = req.user;

  try {
    // if the user have a logo, delete it
    if (user.logo_url && user.logo_url !== "") {
      if (fs.existsSync(`${__basedir}/public/profiles/${user.logo_url}`)) {
        fs.unlinkSync(`${__basedir}/public/profiles/${user.logo_url}`);
      }
    }
  } catch (err) {
    console.log(err);
  }

  await User.findByIdAndUpdate(user._id, {
    logo_url: name,
  });

  res.status(200).json({
    status: "success",
    data: {
      name: name,
    },
  });
});

exports.uploadLicense = catchAsync(async (req, res, next) => {
  async (req, res) => {
    const name = req.name;
    const id = req.body.id;

    await User.findByIdAndUpdate(id, {
      paper_url: name,
    });

    res.status(200).json({
      status: "success",
      data: {
        name: name,
      },
    });
  };
});

// send email
exports.sendEmail = catchAsync(async (req, res, next) => {
  const user = req.user;

  const { cartItems = [] } = req.body;

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

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   // host: "smtp.gmail.com",
  //   port: 587,
  //   auth: {
  //     user: "companypharmalinkclient@gmail.com",
  //     pass: "C@mpany(2021)",
  //   },
  // });

  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "8c7107628803a8",
      pass: "035831fa58bd82",
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

  transport.sendMail(mailOptions);

  res.status(200).json({
    status: "success",
  });
});
