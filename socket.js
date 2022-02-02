// const socket_io = require("socket.io");
const app = require("./app");
const httpServer = require("http").createServer(app);
let io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000/",
    methods: ["GET", "POST"],
  },
});

const User = require("./models/userModel");
const Order = require("./models/orderModel");
const Advertisement = require("./models/advertisementModel");
const Notification = require("./models/notificationModel");
const Item = require("./models/itemModel");

const userStream = User.watch();
const orderStream = Order.watch();
const advertisementStream = Advertisement.watch();
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

advertisementStream.on("change", (change) => {
  console.log(change); // You could parse out the needed info and send only that data.
  io.emit("advertisement-changed", change);
});

notificationStream.on("change", (change) => {
  console.log(change);
  io.emit("notification-changed", change);
});

// itemStream.on("change", (change) => {
//   console.log(change);
// });

io.on("connection", function () {
  console.log("connected");
});

let socket = io;
module.exports = socket;
