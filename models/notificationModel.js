const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    header: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    body: {
      type: String,
    },
    logo_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
