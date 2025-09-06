const express = require("express");
const router = express.Router();
const { createCategory, getProductCount } = require("../controllers/categoryController");

router.post("/", createCategory);
router.get("/:id/product-count", getProductCount);

module.exports = router;
