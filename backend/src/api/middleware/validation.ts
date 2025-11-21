import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../../utils/errors';

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Joi schema
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: Record<string, string[]> = {};

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        validationErrors.body = error.details.map((detail) => detail.message);
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        validationErrors.query = error.details.map((detail) => detail.message);
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        validationErrors.params = error.details.map((detail) => detail.message);
      }
    }

    // If there are validation errors, throw ValidationError
    if (Object.keys(validationErrors).length > 0) {
      next(new ValidationError('Validation failed', validationErrors));
      return;
    }

    next();
  };
};
