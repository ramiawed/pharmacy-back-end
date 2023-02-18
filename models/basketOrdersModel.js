const mongoose = require("mongoose");

const basketOrdersSchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    basket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Basket",
    },
    status: {
      type: String,
    },
    shippedDate: {
      type: Date,
    },
    shippedTime: {
      type: String,
    },
    deliverDate: {
      type: Date,
    },
    deliverTime: {
      type: String,
    },
    couldNotDeliverDate: {
      type: Date,
    },
    confirmDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const BasketOrder = mongoose.model("BasketOrder", basketOrdersSchema);

module.exports = BasketOrder;
