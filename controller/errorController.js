const AppError = require("../utils/appError");

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    field: err.field,
    stack: err.stack,
    error: err,
  });
};

module.exports = (err, req, res, next) => {
  console.log(err);
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `${errors.join("_")}`;
    err.message = message;
    err.statusCode = 400;
    err.status = "fail";
  } else if (err.code === 11000) {
    err.message = "duplicate-value";
    err.statusCode = 400;
    err.status = "fail";
  } else {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    err.message = err.message || "Something went wrong";
    err.field = err.field || [];
  }

  if (process.env.NODE_ENV.trim() === "development") {
    sendDevError(err, res);
  }
};
