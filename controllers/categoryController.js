const mongoose = require("mongoose");
const Category = require("../models/Category");
const { createCategorySchema } = require("../validators/categoryValidator");
const Product = require("../models/Product");

// -----------------------------
// POST /api/categories
// -----------------------------
exports.createCategory = async (req, res, next) => {
  try {
    //  Validate request body
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, description, unspsc_code, parentId } = value;

    //  Check unique UNSPSC
    const exists = await Category.findOne({ unspsc_code });
    if (exists) return res.status(400).json({ error: "UNSPSC code must be unique" });

    //  If parent provided, validate hierarchy depth
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "Invalid parentId format" });
      }

      const parent = await Category.findById(parentId);
      if (!parent) return res.status(404).json({ error: "Parent category not found" });

      // Use aggregation to calculate depth
      const result = await Category.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(parentId) } },
        {
          $graphLookup: {
            from: "categories",
            startWith: "$parentId",
            connectFromField: "parentId",
            connectToField: "_id",
            as: "ancestors",
          },
        },
        { $project: { depth: { $add: [{ $size: "$ancestors" }, 1] } } },
      ]);

      const depth = result.length > 0 ? result[0].depth + 1 : 2;

      if (depth > 4) {
        return res.status(400).json({ error: "Hierarchy cannot exceed 4 levels" });
      }
    }

    //  Create category
    const category = await Category.create({
      name,
      description,
      unspsc_code,
      parentId: parentId || null,
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// -----------------------------
// GET /api/categories/:id/product-count
// -----------------------------
exports.getProductCount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Use $graphLookup to find all descendants
    const result = await Category.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "descendants",
        },
      },
      {
        $project: {
          allIds: {
            $concatArrays: [["$_id"], "$descendants._id"],
          },
        },
      },
    ]);

    const allCategoryIds = result.length > 0 ? result[0].allIds : [id];

    // Count products under this category + all descendants
    const count = await Product.countDocuments({
      categoryId: { $in: allCategoryIds },
    });

    res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
};
