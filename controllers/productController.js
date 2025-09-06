const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, image, categoryId } = req.body;

    //  Validate required fields
    if (!name || !description || !image || !categoryId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //  Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: "Invalid categoryId format" });
    }

    //  Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }


    const result = await Category.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(categoryId) } },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$parentId",
          connectFromField: "parentId",
          connectToField: "_id",
          as: "ancestors",
        },
      },
      {
        $project: {
          depth: { $add: [{ $size: "$ancestors" }, 1] },
        },
      },
    ]);

    const level = result.length > 0 ? result[0].depth : 1;

    if (level !== 4) {
      return res.status(400).json({
        error: "Products can only belong to a level-4 (Commodity) category",
      });
    }

    // Create product
    const product = await Product.create({ name, description, image, categoryId });

    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
