import Joi from 'joi';
import createError from 'http-errors';

// Generic validation middleware: validates req[property] against a Joi schema
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) {
    // Aggregate all validation error messages
    return next(createError(400, error.details.map(d => d.message).join(', ')));
  }
  req[property] = value; // sanitized and validated data
  return next();
};

// Validators for user registration input
export const registerValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
  })
);

// Validators for user login input
export const loginValidator = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
  })
);

// Validators for creating an event
export const eventCreateValidator = validate(
  Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(2000),
    posterUrl: Joi.string().uri().allow(''),
    date: Joi.date().iso().required(),
    time: Joi.string().allow(''),
    venue: Joi.string().allow(''),
    clubId: Joi.string().hex().length(24).required(),
  })
);

// Validators for updating an event (at least 1 field required)
export const eventUpdateValidator = validate(
  Joi.object({
    title: Joi.string().min(2).max(200),
    description: Joi.string().allow('').max(2000),
    posterUrl: Joi.string().uri().allow(''),
    date: Joi.date().iso(),
    time: Joi.string().allow(''),
    venue: Joi.string().allow(''),
  }).min(1)
);

// Validators for creating a club
export const clubCreateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
    logoUrl: Joi.string().uri().allow(''),
    description: Joi.string().allow('').max(2000),
    contact: Joi.string().allow('').max(200),
  })
);

// Validators for updating a club (at least 1 field required)
export const clubUpdateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120),
    logoUrl: Joi.string().uri().allow(''),
    description: Joi.string().allow('').max(2000),
    contact: Joi.string().allow('').max(200),
  }).min(1)
);

// Validators for creating a notification
export const notificationCreateValidator = validate(
  Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(2000),
    date: Joi.date().iso(),
    type: Joi.string().valid('event', 'update', 'reminder').default('update'),
    link: Joi.string().uri().allow(''),
    clubId: Joi.string().hex().length(24).allow(''),
    eventId: Joi.string().hex().length(24).allow(''),
  })
);

export default validate;
