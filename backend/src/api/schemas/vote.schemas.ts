import Joi from 'joi';

/**
 * Submit vote schema
 */
export const submitVoteSchema = {
  body: Joi.object({
    questionId: Joi.string().uuid().required().messages({
      'string.uuid': 'Question ID must be a valid UUID',
      'any.required': 'Question ID is required',
    }),
    optionId: Joi.string().uuid().required().messages({
      'string.uuid': 'Option ID must be a valid UUID',
      'any.required': 'Option ID is required',
    }),
    timeSpent: Joi.number().integer().min(0).max(300000).optional().messages({
      'number.base': 'Time spent must be a number',
      'number.integer': 'Time spent must be an integer',
      'number.min': 'Time spent cannot be negative',
      'number.max': 'Time spent cannot exceed 5 minutes (300000ms)',
    }),
  }),
};

/**
 * Get user votes schema
 */
export const getUserVotesSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
    }),
    offset: Joi.number().integer().min(0).optional().default(0).messages({
      'number.base': 'Offset must be a number',
      'number.integer': 'Offset must be an integer',
      'number.min': 'Offset cannot be negative',
    }),
  }),
};
