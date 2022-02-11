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
    origin: ["*"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "my-custom-header",
        "Access-Control-Allow-Credentials": true,
      });
      res.end();
    },
  },
});

const User = require("./models/userModel");
const Order = require("./models/orderModel");
const Notification = require("./models/notificationModel");
const Setting = require("./models/settingModel");

const userStream = User.watch();
const orderStream = Order.watch();
const notificationStream = Notification.watch();
const settingStream = Setting.watch();
// const itemStream = Item.watch();

userStream.on("change", async (change) => {
  console.log(change); // You could parse out the needed info and send only that data.
  if (change.operationType === "update") {
    if (
      (Object.keys(change.updateDescription.updatedFields).includes(
        "isApproved"
      ) &&
        change.updateDescription.updatedFields.isApproved === false) ||
      (Object.keys(change.updateDescription.updatedFields).includes(
        "isActive"
      ) &&
        change.updateDescription.updatedFields.isActive === false)
    ) {
      io.emit("user-sign-out", change.documentKey._id);
    }

    // add user to companies section one or warehouses section one
    if (
      Object.keys(change.updateDescription.updatedFields).includes(
        "inSectionOne"
      ) &&
      change.updateDescription.updatedFields.inSectionOne === true
    ) {
      const user = await User.findById(change.documentKey._id).select(
        "_id type logo_url allowShowingMedicines name city"
      );
      if (user.type === "company") {
        io.emit("user-added-to-section-one", user);
      } else {
        io.emit("warehouse-added-to-section-one", user);
      }
    }

    // remove user from companies section one or warehouses section one
    if (
      Object.keys(change.updateDescription.updatedFields).includes(
        "inSectionOne"
      ) &&
      change.updateDescription.updatedFields.inSectionOne === false
    ) {
      const user = await User.findById(change.documentKey._id).select(
        "_id type logo_url allowShowingMedicines name city"
      );
      if (user.type === "company") {
        io.emit("user-removed-from-section-one", user._id);
      } else {
        io.emit("warehouse-removed-from-section-one", user._id);
      }
    }

    // add user to companies section two
    if (
      Object.keys(change.updateDescription.updatedFields).includes(
        "inSectionTwo"
      ) &&
      change.updateDescription.updatedFields.inSectionTwo === true
    ) {
      const user = await User.findById(change.documentKey._id).select(
        "_id type logo_url allowShowingMedicines name city"
      );
      io.emit("user-added-to-section-two", user);
    }

    // remove user to companies section two
    if (
      Object.keys(change.updateDescription.updatedFields).includes(
        "inSectionTwo"
      ) &&
      change.updateDescription.updatedFields.inSectionTwo === false
    ) {
      const user = await User.findById(change.documentKey._id).select(
        "_id type logo_url allowShowingMedicines name city"
      );
      io.emit("user-removed-from-section-two", user._id);
    }
  }

  io.emit("user-changed", change);
});

orderStream.on("change", (change) => {
  console.log(change); // You could parse out the needed info and send only that data.
  io.emit("order-changed", change);
});

notificationStream.on("change", (change) => {
  console.log(change);
  io.emit("notification-changed", change);
});

settingStream.on("change", (change) => {
  console.log(change);
  io.emit("settings-changed", change);
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
httpServer.listen(port);
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
