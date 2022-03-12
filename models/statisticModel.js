const mongoose = require("mongoose");

const statisticSchema = new mongoose.Schema(
  {
    sourceUser: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    targetItem: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    actionDate: {
      type: Date,
      default: Date.now(),
    },

    action: {
      type: String,
      enum: [
        "",
        "user-sign-in",
        "choose-company",
        "user-added-to-favorite",
        "choose-item",
        "item-added-to-cart",
        "item-added-to-favorite",
        "item-ordered",
        "user-made-an-order",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Statistic = mongoose.model("Statistic", statisticSchema);

module.exports = Statistic;
