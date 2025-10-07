import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3030),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_SHORT: Joi.string().required(),
  JWT_EXPIRATION_LONG: Joi.string().required(),

  EMAIL_FROM: Joi.string().email().required(),

  APP_URL: Joi.string().uri().required(),

  SMTP_PASS: Joi.string().required(),
  SMTP_USER: Joi.string().email().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
});
