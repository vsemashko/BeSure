import Joi from 'joi';

/**
 * Create question schema
 */
export const createQuestionSchema = {
  body: Joi.object({
    content: Joi.string().min(10).max(500).trim().required().messages({
      'string.min': 'Question must be at least 10 characters long',
      'string.max': 'Question must not exceed 500 characters',
      'any.required': 'Question content is required',
    }),
    options: Joi.array()
      .items(
        Joi.object({
          text: Joi.string().min(1).max(200).trim().required().messages({
            'string.min': 'Option text must be at least 1 character',
            'string.max': 'Option text must not exceed 200 characters',
            'any.required': 'Option text is required',
          }),
          isCorrect: Joi.boolean().required().messages({
            'any.required': 'isCorrect field is required for each option',
          }),
        })
      )
      .min(2)
      .max(6)
      .required()
      .messages({
        'array.min': 'At least 2 options are required',
        'array.max': 'Maximum 6 options allowed',
        'any.required': 'Options are required',
      }),
    explanation: Joi.string().min(10).max(1000).trim().optional().messages({
      'string.min': 'Explanation must be at least 10 characters long',
      'string.max': 'Explanation must not exceed 1000 characters',
    }),
    source: Joi.string().max(500).trim().optional().messages({
      'string.max': 'Source must not exceed 500 characters',
    }),
    topicId: Joi.string().uuid().optional().messages({
      'string.uuid': 'Topic ID must be a valid UUID',
    }),
    difficulty: Joi.string()
      .valid('EASY', 'MEDIUM', 'HARD')
      .optional()
      .messages({
        'any.only': 'Difficulty must be one of: EASY, MEDIUM, HARD',
      }),
  }).custom((value: { options: Array<{ text: string; isCorrect: boolean }> }, helpers: Joi.CustomHelpers) => {
    // Custom validation: At least one option must be correct
    const hasCorrectOption = value.options.some((opt) => opt.isCorrect === true);
    if (!hasCorrectOption) {
      return helpers.error('options.noCorrect');
    }
    return value;
  }, 'Correct option validation'),
};

/**
 * Update question schema
 */
export const updateQuestionSchema = {
  body: Joi.object({
    content: Joi.string().min(10).max(500).trim().optional().messages({
      'string.min': 'Question must be at least 10 characters long',
      'string.max': 'Question must not exceed 500 characters',
    }),
    explanation: Joi.string().min(10).max(1000).trim().optional().messages({
      'string.min': 'Explanation must be at least 10 characters long',
      'string.max': 'Explanation must not exceed 1000 characters',
    }),
    source: Joi.string().max(500).trim().optional().messages({
      'string.max': 'Source must not exceed 500 characters',
    }),
    isActive: Joi.boolean().optional(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'Question ID must be a valid UUID',
      'any.required': 'Question ID is required',
    }),
  }),
};

/**
 * Get question by ID schema
 */
export const getQuestionByIdSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.uuid': 'Question ID must be a valid UUID',
      'any.required': 'Question ID is required',
    }),
  }),
};

/**
 * Get random questions schema
 */
export const getRandomQuestionsSchema = {
  query: Joi.object({
    count: Joi.number().integer().min(1).max(50).optional().default(10).messages({
      'number.base': 'Count must be a number',
      'number.integer': 'Count must be an integer',
      'number.min': 'Count must be at least 1',
      'number.max': 'Count must not exceed 50',
    }),
    topicId: Joi.string().uuid().optional().messages({
      'string.uuid': 'Topic ID must be a valid UUID',
    }),
    difficulty: Joi.string()
      .valid('EASY', 'MEDIUM', 'HARD')
      .optional()
      .messages({
        'any.only': 'Difficulty must be one of: EASY, MEDIUM, HARD',
      }),
  }),
};
