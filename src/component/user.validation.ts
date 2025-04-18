import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import { UserRService } from './service'

const UserRsValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','org','info', 'biz', 'gov', 'edu', 'co', 'rw'] } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email address is required',
    }),
  password: Joi.string()
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      ),
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.',
      'any.required': 'Password is required.',
    }),
  firstName: Joi.string().min(3).max(20).required().messages({
    'string.min': 'First name must be at least 3 characters long',
    'string.max': 'First name cannot exceed 20 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Last name must be at least 3 characters long',
    'string.max': 'Last name cannot exceed 20 characters',
    'any.required': 'Last name is required',
  }),
  role: Joi.string()
    .valid( 'admin','UserR')
    .required()
    .messages({
      'any.only': 'Role  not allowed',
      'any.required': 'Role is required',
    }),
})

export const validateUserR = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { error } = UserRsValidation.validate(req.body, { abortEarly: false })

  // If there's a validation error, return a 400 response
  if (error) {
    res.status(400).json({
      status: 'fail',
      data: {
        message: error.details[0].message,
      },
    })
    return // No need to return a Response object
  }

  const { email } = req.body

  // Check if email is provided
  if (!email) {
    res.status(400).json({
      message: 'Email address is required',
    })
    return // Stop execution here
  }

  try {
    // Fetch UserR by email
    const UserR = await UserRService.getUserRByEmail(email)

    // If UserR exists, return a 409 conflict response
    if (UserR) {
      res.status(409).json({
        message: 'UserR already exists. Please login again',
      })
      return // Stop execution here
    }

    // If no UserR exists, move to the next middleware
    next()
  } catch (err) {
    // Handle any errors by passing them to the next error handler
    next(err)
  }
}

const loginValidation = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','org','info', 'biz', 'gov', 'edu', 'co', 'rw'] } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email address is required',
    }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
  }),
})

export const validateUserRLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = loginValidation.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400).json({
      status: 'fail',
      data: {
        message: error.details.map((detail) => detail.message).join(', '),
      },
    })
    return // Ensure to exit the function after sending a response
  }

  next() // Proceed to the next middleware if validation passes
}

