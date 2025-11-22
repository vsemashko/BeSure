import Joi from 'joi';

/**
 * Password validation rules:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    'any.required': 'Password is required',
  });

/**
 * Email validation
 */
const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .max(255)
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 255 characters',
    'any.required': 'Email is required',
  });

/**
 * Username validation
 */
const usernameSchema = Joi.string()
  .alphanum()
  .min(3)
  .max(30)
  .trim()
  .required()
  .messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 30 characters',
    'any.required': 'Username is required',
  });

/**
 * Register schema
 */
export const registerSchema = {
  body: Joi.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    displayName: Joi.string().min(1).max(100).trim().optional().messages({
      'string.min': 'Display name must be at least 1 character',
      'string.max': 'Display name must not exceed 100 characters',
    }),
  }),
};

/**
 * Login schema
 */
export const loginSchema = {
  body: Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

/**
 * Refresh token schema
 */
export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
      'string.empty': 'Refresh token cannot be empty',
    }),
  }),
};

/**
 * Update profile schema
 */
export const updateProfileSchema = {
  body: Joi.object({
    username: usernameSchema.optional(),
    profileData: Joi.object({
      avatarUrl: Joi.string().uri().max(500).optional(),
      bio: Joi.string().max(500).optional(),
      displayName: Joi.string().max(100).optional(),
    }).optional(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      pushNotifications: Joi.boolean().optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    }).optional(),
  }).min(1), // At least one field required
};

/**
 * Change password schema
 */
export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: passwordSchema,
  }),
};
