const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderDate: {
      type: Date,
      default: Date.now(),
    },
    seenByAdmin: {
      type: Boolean,
      default: false,
    },
    warehouseStatus: {
      type: String,
      default: "unread",
    },
    pharmacyStatus: {
      type: String,
      default: "sent",
    },

    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        qty: {
          type: Number,
          default: 1,
        },
        bonus: {
          type: Number,
        },
        bonusType: {
          type: String,
        },
        price: {
          type: Number,
        },
        customer_price: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
