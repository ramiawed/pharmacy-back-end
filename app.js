const express = require("express");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();

// body parser, reading data from body into req.body
app.use(express.json());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// function to handle all the router that doesn't catch by
// previous routes
// * means all the routes
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
