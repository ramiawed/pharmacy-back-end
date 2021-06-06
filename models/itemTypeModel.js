const mongoose = require("mongoose");

const itemTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A item type must have a name"],
      unique: [true, "A item type must have a unique name"],
    },
  },
  {
    timestamps: true,
  }
);

const ItemType = mongoose.model("ItemType", itemTypeSchema);

module.exports = ItemType;
