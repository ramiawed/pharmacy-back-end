const express = require("express");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const userRouter = require("./routes/userRoutes");
const categoryRoute = require("./routes/categoryRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

// body parser, reading data from body into req.body
app.use(express.json());

// MIDDLEWARE
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
}

// Serving static files
app.use(express.static(`${__dirname}/public`));

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/items", itemRoutes);

// function to handle all the router that doesn't catch by
// previous routes
// * means all the routes
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
