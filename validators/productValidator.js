const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(1000).required(),
  image: Joi.string().uri().required(),
  categoryId: Joi.string().required(),
});

module.exports = { createProductSchema };
