const express = require("express");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const userRouter = require("./routes/userRoutes");
const categoryRoute = require("./routes/categoryRoutes");
const itemRoutes = require("./routes/itemRoutes");
const favoriteRouter = require("./routes/favoriteRoutes");

const app = express();

// body parser, reading data from body into req.body
app.use(express.json());

// MIDDLEWARE
if (process.env.NODE_ENV.trim() === "development") {
  app.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      // preflightContinue: false,
      // optionsSuccessStatus: 204,
    })
  );
}

// Serving static files
app.use(express.static(`${__dirname}/public`));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
//   next();
// });

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/favorites", favoriteRouter);

// function to handle all the router that doesn't catch by
// previous routes
// * means all the routes
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
