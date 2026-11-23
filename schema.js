const BaseJoi = require("joi");
//requiring Joi and calling it base (we are later gonna require an extension)
const sanitizeHtml = require("sanitize-html");
//this package does the job of sanitizing the inputs
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    //this is the property and it needs to have a function called validate()
    escapeHTML: {
      validate(value, helpers) {
        //here i using a package called sanitizeHtml
        const clean = sanitizeHtml(value, {
          //providing allowed options
          allowedTags: [],
          allowedAttributes: {},
        });
        //if there is a difference between input and sanitized output means something is removed
        if (clean !== value)
          //this return an error
          return helpers.error("string.escapeHTML", { value });
        //string .escapeHTML is defined in message
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);
//here I'm passing in an extension on Joi
//now we can use escapeHTML()
const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    //image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});

module.exports = { campgroundSchema, reviewSchema };
