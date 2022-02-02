const mongoose = require("mongoose");
const dotenv = require("dotenv");

// handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down");
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const httpServer = require("http").createServer(app);
let io = require("socket.io")(httpServer, {
  cors: {
    origin: "*:*",
    methods: ["GET", "POST"],
  },
});

const User = require("./models/userModel");
const Order = require("./models/orderModel");
const Notification = require("./models/notificationModel");

const userStream = User.watch();
const orderStream = Order.watch();
const notificationStream = Notification.watch();
// const itemStream = Item.watch();

userStream.on("change", (change) => {
  // console.log(change); // You could parse out the needed info and send only that data.
  io.emit("changeData", change);
});

orderStream.on("change", (change) => {
  console.log(change); // You could parse out the needed info and send only that data.
  io.emit("order-changed", change);
});

notificationStream.on("change", (change) => {
  console.log(change);
  io.emit("notification-changed", change);
});

// DATABASE CONFIGURATION OPTION {USERNAME, PASSWORD, DBNAME}
const DB_USER = process.env.DATABASE_USER;
const DB_PASSWORD = process.env.DATABASE_PASSWORD;
const DB_NAME = process.env.DATABASE_NAME;

// BUILD THE CONNECTION STRING
let DB = process.env.DATABASE.replace("<user>", DB_USER);
DB = DB.replace("<password>", DB_PASSWORD);
DB = DB.replace("<dbname>", DB_NAME);

// const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

// require("./socket");

const port = process.env.PORT || 8000;
httpServer.listen();
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}`);
// });

// handle all promise rejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
