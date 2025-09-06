const express = require("express");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
