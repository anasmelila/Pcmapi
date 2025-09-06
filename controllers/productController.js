// controllers/productController.js
const Product = require("../models/Product");
const Category = require("../models/Category");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, image, categoryId } = req.body;

    if (!name || !description || !image || !categoryId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Calculate depth
    const level = await Category.getCategoryLevel(categoryId);

    if (level !== 4) {
      return res.status(400).json({ error: "Products can only belong to a level-4 (Commodity) category" });
    }

    const product = new Product({ name, description, image, categoryId });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
