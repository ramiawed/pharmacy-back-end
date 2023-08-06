const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");

const userAllowedFields = [
  "name",
  "username",
  "password",
  "passwordConfirm",
  "type",
  "logo_url",
  "phone",
  "mobile",
  "email",
  "city",
  "addressDetails",
  "employeeName",
  "certificateName",
  "guestDetails",
  "allowAdmin",
  "allowShowingMedicines",
  "paper_url",
  "inSectionOne",
  "inSectionTwo",
];

// remove unwanted property from object
const filterObj = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (userAllowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

// create a token with id in its payload
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV.trim() === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  // remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        type: user.type,
        logo_url: user.logo_url,
        city: user.city,
        ourCompanies: user.ourCompanies,
        points: user.points,
      },
    },
  });
};

// create a new user
exports.signup = catchAsync(async (req, res, next) => {
  // remove all fields that doesn't matter
  const filterUser = filterObj(req.body);

  // // check if the name is unique
  // // if doesn't return an Error
  // const findUserByName = await User.findOne({ name: req.body.name });
  // if (findUserByName) {
  //   return next(new AppError("provide unique name", 400, ["name"]));
  // }

  // check if the username is unique
  // if doesn't return an Error
  const findUserByUsername = await User.findOne({
    username: req.body.username,
  });

  if (findUserByUsername) {
    return next(new AppError("provide unique username", 400, ["username"]));
  }

  // create a new user
  const newUser = await User.create({
    ...filterUser,
    username: filterUser.username.trim(),
  });

  // check if something goes wrong
  if (!newUser) {
    return next(new AppError("something went wrong", 400, ""));
  }

  // return success
  res.status(201).json({
    status: "success",
    data: {
      id: newUser._id,
    },
  });
});

// sign in to the app
// you need to provide username and password
// if sign in success return the user and the token
exports.signin = catchAsync(async (req, res, next) => {
  const { username, password, version } = req.body;

  // 1- check if email and password exist
  if (!username || !password) {
    return next(new AppError("please provide username and password", 400));
  }

  // 2- check if the use exists && password is correct
  const user = await User.findOne({ username }).select("+password +isActive");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect username or password", 401));
  }

  if (user && !user.isActive) {
    return next(
      new AppError(`you have to approve your account from Admin`, 401)
    );
  }

  if (version !== process.env.VERSION) {
    return next(new AppError("update the app"));
  }

  // 3- if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.signinWithToken = catchAsync(async (req, res, next) => {
  const { token, version } = req.body;

  if (version !== process.env.VERSION) {
    return next(new AppError("update the app"));
  }
  try {
    // 2- verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3- check if the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError(
          "the user belonging to this token does no longer exist",
          401
        )
      );
    }

    // return success
    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          type: user.type,
          logo_url: user.logo_url,
          city: user.city,
          ourCompanies: user.ourCompanies,
          points: user.points,
        },
      },
    });
  } catch (err) {
    return next(
      new AppError("you are not logged in! Please log in to get access", 401)
    );
  }
});

// this middleware use to grant access to protected routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1- Getting the token and check
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  try {
    // 2- verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3- check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    // grant access to protected route
    req.user = currentUser;

    next();
  } catch (err) {
    // if (!token) {
    return next(
      new AppError("you are not logged in! Please log in to get access", 401)
    );
    // }
  }
});

// restrict access to some routes based on the type of the user
exports.restrictTo = (...types) => {
  return (req, res, next) => {
    // types is an array of string
    if (!types.includes(req.user.type)) {
      return next(
        new AppError("you don't have permission to perform this action", 403)
      );
    }
    next();
  };
};

// check if the username is available or not
exports.checkUsername = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  let available = false;
  const findUser = await User.findOne({ username });

  if (!findUser) {
    available = true;
  }

  res.status(200).json({
    status: "success",
    available,
  });
});

exports.checkVersion = catchAsync(async (req, res, next) => {
  const { version } = req.params;

  const check = version === process.env.VERSION;

  res.status(200).json({
    check,
  });
});
