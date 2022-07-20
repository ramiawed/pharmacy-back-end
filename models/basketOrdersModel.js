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
  },
  {
    timestamps: true,
  }
);

const BasketOrder = mongoose.model("BasketOrder", basketOrdersSchema);

module.exports = BasketOrder;
