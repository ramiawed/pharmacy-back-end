var mongoose = require("mongoose");

var itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "An item must have a name"],
      unique: [true, "An item must have a unique name"],
    },
    trade_name: {
      type: String,
      required: [true, "An item must have a trade name"],
    },
    caliber: [
      {
        value: {
          type: String,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        warehouse: [
          {
            warehouse_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            offer_percentage: {
              qty: { type: Number },
              percentage: { type: Number },
            },
            offer_bonus: {
              qty: { type: Number },
              bonus_qty: { type: Number },
            },
            offer_item: {
              item_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
              },
              qty: { type: Number },
              bonus_qty: { type: Number },
            },
          },
        ],
      },
    ],
    price: {
      type: Number,
      default: 0.0,
    },
    logo_url: {
      type: String,
    },
    description: {
      type: String,
    },
    pharmacological_composition: [{ type: String }],
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemType",
      required: true,
    },
    tags: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "An item must have a category"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "An Item must have a company"],
      ref: "User",
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

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
