var mongoose = require("mongoose");

var itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "An item must have a trade name"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "An Item must have a company"],
      ref: "User",
    },
    caliber: {
      type: String,
    },
    //  الشكل الصيدلاني
    formula: {
      type: String,
    },
    // الاستطباب
    indication: {
      type: String,
    },
    // التركيب الدوائي
    composition: {
      type: String,
    },
    // التعبئة
    packing: {
      type: String,
    },
    price: {
      type: Number,
      default: 0.0,
    },
    customer_price: {
      type: Number,
      default: 0.0,
    },
    warehouses: [
      {
        warehouse: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        maxQty: {
          type: Number,
          default: 0,
        },
        addedAt: {
          type: Date,
          default: new Date(),
        },
        orderNumber: {
          type: Number,
          default: 1,
        },
      },
    ],
    logo_url: {
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

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
