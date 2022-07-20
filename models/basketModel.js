const mongoose = require("mongoose");

const basketSchema = new mongoose.Schema(
  {
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
          default: 0,
        },
        bonus: {
          type: Number,
          default: 0,
        },
        isFree: {
          type: Boolean,
          default: false,
        },
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    gift: {
      type: String,
    },
    note: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Basket = mongoose.model("Basket", basketSchema);

module.exports = Basket;
