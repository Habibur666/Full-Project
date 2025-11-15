// schema.js
// Joi validation schemas for incoming form payloads.
// - listingSchema: validates listing create/update payload
// - reviewSchema: validates review payload nested under `review` key
const Joi = require("joi");

// Accept either a string image URL or an image object with a url property
const imageSchema = Joi.alternatives().try(
  Joi.string().allow('', null),
  Joi.object({ url: Joi.string().allow('', null) })
);

// Validate the flat body fields submitted by the form (title, description, price, etc.)
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

