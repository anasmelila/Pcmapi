require("dotenv").config();
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");

async function seed() {
  await connectDB(process.env.MONGO_URI);

  // Clear old data
  await Product.deleteMany({});
  await Category.deleteMany({});

  // --- 4-level UNSPSC hierarchy ---
  const segment = await Category.create({
    name: "Food Products",
    description: "Food products segment",
    unspsc_code: "50000000",
    parentId: null,
  });

  const family = await Category.create({
    name: "Fruits and Vegetables",
    description: "Fruit & veg family",
    unspsc_code: "50130000",
    parentId: segment._id,
  });

  const classCategory = await Category.create({
    name: "Canned Fruits",
    description: "Canned fruits class",
    unspsc_code: "50131700",
    parentId: family._id,
  });

  const commodity = await Category.create({
    name: "Canned Peaches",
    description: "Peaches preserved in cans",
    unspsc_code: "50131703",
    parentId: classCategory._id,
  });

  // --- Product under commodity ---
  const product = await Product.create({
    name: "Organic Peaches",
    description: "Fresh canned peaches",
    image: "http://example.com/peach.jpg",
    categoryId: commodity._id,
  });

  console.log(" Seed complete");
  console.log("Segment id:", segment._id.toString());
  console.log("Family id:", family._id.toString());
  console.log("Class id:", classCategory._id.toString());
  console.log("Commodity id:", commodity._id.toString());
  console.log("Product id:", product._id.toString());

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
