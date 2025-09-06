const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(500).required(),
  unspsc_code: Joi.string().pattern(/^\d{8}$/).required(), // 8-digit UNSPSC
  parentId: Joi.string().optional().allow(null, ""),
});

module.exports = { createCategorySchema };
