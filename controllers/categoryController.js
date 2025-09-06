const Category = require("../models/Category");
const { createCategorySchema } = require("../validators/categoryValidator");

// Helper: find depth in hierarchy
const getCategoryDepth = async (parentId) => {
  let depth = 1;
  let currentParent = parentId ? await Category.findById(parentId) : null;

  while (currentParent && currentParent.parentId) {
    depth++;
    currentParent = await Category.findById(currentParent.parentId);
  }

  return depth;
};

// POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, description, unspsc_code, parentId } = value;

    // Check unique UNSPSC
    const exists = await Category.findOne({ unspsc_code });
    if (exists) return res.status(400).json({ error: "UNSPSC code must be unique" });

    // If parent provided, validate hierarchy depth
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(404).json({ error: "Parent category not found" });

      const depth = (await getCategoryDepth(parentId)) + 1;
      if (depth > 4) {
        return res.status(400).json({ error: "Hierarchy cannot exceed 4 levels" });
      }
    }

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

// Helper: get descendants recursively
const getDescendants = async (categoryId) => {
  const children = await Category.find({ parentId: categoryId });
  let all = [...children];

  for (const child of children) {
    const descendants = await getDescendants(child._id);
    all = all.concat(descendants);
  }

  return all;
};

// GET /api/categories/:id/product-count
exports.getProductCount = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) return res.status(404).json({ error: "Category not found" });

    const descendants = await getDescendants(categoryId);
    const allCategoryIds = [categoryId, ...descendants.map((c) => c._id)];

    const Product = require("../models/Product");
    const count = await Product.countDocuments({ categoryId: { $in: allCategoryIds } });

    res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
};

