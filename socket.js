const socket_io = require("socket.io");
let io = socket_io();

const User = require("./models/userModel");
const Item = require("./models/itemModel");

const userStream = User.watch();
const itemStream = Item.watch();

userStream.on("change", (change) => {
  console.log(change); // You could parse out the needed info and send only that data.
  io.emit("changeData", change);
});

itemStream.on("change", (change) => {
  console.log(change);
});

io.on("connection", function () {
  console.log("connected");
});

let socket = io;
module.exports = socket;
