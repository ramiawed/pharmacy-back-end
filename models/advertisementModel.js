const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
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

const Advertisement = mongoose.model("Advertisement", advertisementSchema);

module.exports = Advertisement;
