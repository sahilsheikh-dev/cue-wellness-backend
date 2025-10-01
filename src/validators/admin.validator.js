const Joi = require("joi");

const addAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  mobile: Joi.string()
    .pattern(/^\+?\d{7,15}$/)
    .required(), // simple mobile validation
  email: Joi.string().email().optional().allow(null, ""),
  password: Joi.string().min(8).max(128).required(),
  dob: Joi.date().optional(),
  country: Joi.string().optional().allow("", null),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .allow("", null),
  designation: Joi.string().optional().allow("", null),
  permissions: Joi.array().items(Joi.string()).optional(),
  superAdmin: Joi.boolean().optional(),
});

const loginSchema = Joi.object({
  mobile: Joi.string()
    .pattern(/^\+?\d{7,15}$/)
    .required(),
  password: Joi.string().required(),
});

const updateAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  mobile: Joi.string()
    .pattern(/^\+?\d{7,15}$/)
    .optional(),
  email: Joi.string().email().optional().allow(null, ""),
  password: Joi.string().min(8).max(128).optional(),
  dob: Joi.date().optional(),
  country: Joi.string().optional().allow("", null),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .allow("", null),
  designation: Joi.string().optional().allow("", null),
  // do NOT allow permissions or superAdmin here unless requester is superAdmin (controller enforces)
  permissions: Joi.forbidden(),
  superAdmin: Joi.forbidden(),
});

module.exports = { addAdminSchema, loginSchema, updateAdminSchema };
