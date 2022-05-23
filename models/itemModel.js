var mongoose = require("mongoose");

var itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "An item must have a trade name"],
    },
    nameAr: {
      type: String,
      default: "",
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
        offer: {
          mode: {
            type: String,
          },
          offers: [
            {
              qty: {
                type: Number,
              },
              bonus: {
                type: Number,
              },
            },
          ],
        },
      },
    ],
    logo_url: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inSectionOne: {
      type: Boolean,
      default: false,
    },
    inSectionTwo: {
      type: Boolean,
      default: false,
    },
    inSectionThree: {
      type: Boolean,
      default: false,
    },
    barcode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ name: 1, caliber: 1, formula: 1 });
itemSchema.index({ name: 1 });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
