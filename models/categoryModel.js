const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A category must have a name"],
    unique: [true, "A category must have a unique name"],
  },
  logo_url: {
    type: String,
  },
  inActive: {
    type: Boolean,
    default: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
