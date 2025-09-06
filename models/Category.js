// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  unspsc_code: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }
});

// Helper: Calculate level depth recursively
categorySchema.statics.getCategoryLevel = async function (categoryId) {
  let level = 1;
  let current = await this.findById(categoryId).lean();

  while (current && current.parentId) {
    level++;
    current = await this.findById(current.parentId).lean();
  }

  return level;
};

module.exports = mongoose.model("Category", categorySchema);
