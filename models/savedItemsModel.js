const mongoose = require("mongoose");

const savedItemsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SavedItems = mongoose.model("SavedItems", savedItemsSchema);

module.exports = SavedItems;
