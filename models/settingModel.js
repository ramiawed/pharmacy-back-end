const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  showFavoritesCompanies: {
    type: Boolean,
    default: true,
  },
  showNewestCompanies: {
    type: Boolean,
    default: true,
  },
  showFavoritesItems: {
    type: Boolean,
    default: true,
  },
  showNewestItems: {
    type: Boolean,
    default: true,
  },
  showMostOrderedItems: {
    type: Boolean,
    default: true,
  },
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
