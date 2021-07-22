const express = require("express");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const userRouter = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const favoriteRouter = require("./routes/favoriteRoutes");

global.__basedir = __dirname;

const app = express();

// body parser, reading data from body into req.body
app.use(express.json({ limit: "10mb" }));

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

// const multer = require("multer");
// const fs = require("fs");
// const { promisify } = require("util");
// const pipeline = promisify(require("stream").pipeline);
// const upload = multer();

// app.post("/api/v1/upload", upload.single("file"), async (req, res, next) => {
//   const {
//     file,
//     body: { name },
//   } = req;

//   const fileName = "background.jpg";

//   await pipeline(
//     file.stream,
//     fs.createWriteStream(`${__dirname}/public/${fileName}`)
//   );

//   res.send("file uploaded");
// });

// routes

app.use("/api/v1/users", userRouter);
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
