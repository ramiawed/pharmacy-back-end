const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  companiesSectionOne: {
    show: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "company section one title",
    },
    description: {
      type: String,
      default: "company section one description",
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  companiesSectionTwo: {
    show: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "company section one title",
    },
    description: {
      type: String,
      default: "company section one description",
    },
    order: {
      type: Number,
      default: 2,
    },
  },
  warehousesSectionOne: {
    show: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "warehouse section one title",
    },
    description: {
      type: String,
      default: "warehouse section one description",
    },
    order: {
      type: Number,
      default: 3,
    },
  },
  itemsSectionOne: {
    show: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "item section one title",
    },
    description: {
      type: String,
      default: "item section one description",
    },
    order: {
      type: Number,
      default: 4,
    },
  },
  itemsSectionTwo: {
    show: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "item section two title",
    },
    description: {
      type: String,
      default: "item section two description",
    },
    order: {
      type: Number,
      default: 5,
    },
  },
  itemsSectionThree: {
    show: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "item section three title",
    },
    description: {
      type: String,
      default: "item section three description",
    },
    order: {
      type: Number,
      default: 6,
    },
  },
  showWarehouseItem: {
    type: Boolean,
    default: false,
  },
  saveOrders: {
    type: Boolean,
    default: false,
  },
  showAdvertisements: {
    type: Boolean,
    default: false,
  },
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
