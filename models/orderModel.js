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
      },
    ],
    totalInvoicePrice: {
      type: Number,
      default: 0,
    },
    totalInvoicePoints: {
      type: Number,
      default: 0,
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
    editingDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
