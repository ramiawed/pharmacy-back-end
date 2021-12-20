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
    titleRight: {
      type: Boolean,
      default: true,
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
    titleRight: {
      type: Boolean,
      default: false,
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
    titleRight: {
      type: Boolean,
      default: false,
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
    titleRight: {
      type: Boolean,
      default: true,
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
    titleRight: {
      type: Boolean,
      default: false,
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
    titleRight: {
      type: Boolean,
      default: true,
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
