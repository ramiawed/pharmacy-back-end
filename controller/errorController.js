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
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong";
  err.field = err.field || [];
  if (process.env.NODE_ENV.trim() === "development") {
    sendDevError(err, res);
  }
};
