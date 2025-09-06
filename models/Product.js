const mongoose = require("mongoose");
const Category = require("./Category");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
});

// Validation: categoryId must be a level-4 category
productSchema.pre("save", async function (next) {
  const category = await Category.findById(this.categoryId);
  if (!category) {
    return next(new Error("Invalid categoryId: Category not found"));
  }

  // Calculate depth
  let depth = 1;
  let currentParent = category.parentId;
  while (currentParent) {
    const parentCategory = await Category.findById(currentParent);
    if (!parentCategory) break;
    depth++;
    currentParent = parentCategory.parentId;
  }

  if (depth !== 4) {
    return next(new Error("Products can only belong to a level-4 (Commodity) category"));
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
