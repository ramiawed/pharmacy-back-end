const express = require("express");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

// routers
const userRouter = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const favoriteRouter = require("./routes/favoriteRoutes");
const statisticsRouter = require("./routes/statisticsRoutes");
const settingRouter = require("./routes/settingRoutes");
const orderRouter = require("./routes/orderRoutes");
const advertisementRouter = require("./routes/advertisementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const savedItemRouter = require("./routes/savedItemRoutes");
const basketRouter = require("./routes/basketRoutes");
const basketOrdersRoutes = require("./routes/basketOrdersRoutes");

global.__basedir = __dirname;

const app = express();

// body parser, reading data from body into req.body
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// MIDDLEWARE
app.use(cors());
// if (process.env.NODE_ENV.trim() === "development") {
// }

// Serving static files
app.use(express.static(`${__dirname}/public`));

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/favorites", favoriteRouter);
app.use("/api/v1/statistics", statisticsRouter);
app.use("/api/v1/settings", settingRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/advertisement", advertisementRouter);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/savedItems", savedItemRouter);
app.use("/api/v1/baskets", basketRouter);
app.use("/api/v1/ordered-baskets", basketOrdersRoutes);

// function to handle all the router that doesn't catch by
// previous routes
// * means all the routes
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
