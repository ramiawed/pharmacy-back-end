class AppError extends Error {
  constructor(message, statusCode, field) {
    super();

    this.message = message;
    this.statusCode = statusCode;
    this.field = field || [];
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // capture stackTrace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
