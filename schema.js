const Joi = require("joi");

const imageSchema = Joi.alternatives().try(
  Joi.string().allow('', null),
  Joi.object({ url: Joi.string().allow('', null) })
);

const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().min(0),
  location: Joi.string().required(),
  country: Joi.string().required(),
  image: imageSchema
});

module.exports = { listingSchema };

module.exports.reviewSchema=Joi.object({
  review: Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comment:Joi.string().required(),
  }).required()
})

