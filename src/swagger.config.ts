import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Factor Authentication Documentation',
      version: '1.0.0',
      description: 'APIs for Multi-Factor Authentication App',
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local Development Server for Swagger',
      },
      {
        url: '#',
        description: 'Production server (HTTPS)',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints for  registration, login and MFA',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/api/users/signup': {
        post: {
          summary: 'Create an account',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: {
                      type: 'string',
                      example: 'Mugisha',
                    },
                    lastName: {
                      type: 'string',
                      example: 'Emmy',
                    },
                    email: {
                      type: 'string',
                      example: 'emmanuelmugisha146@gmail.com',
                    },
                    password: {
                      type: 'string',
                      example: 'Password@123',
                    },
                    role: {
                      type: 'string',
                      example: 'student',
                    },
                    
                  },
                  required: [
                    'firstName',
                    'lastName',
                    'email',
                    'password',
                    'role',
                  ],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                    },
                    required: [
                      'firstName',
                      'lastName',
                      'email',
                      'role',
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
            },
          },
        },
      },

      '/api/users/login': {
        post: {
          summary: 'Login with Email and Password',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      example: 'emmanuelmugisha146@gmail.com',
                    },
                    password: {
                      type: 'string',
                      example: 'Password@123',
                    },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User logged in successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      
      '/api/users/verify-email': {
        get: {
          summary: 'Verify Email',
          tags: ['Email Verification'],
          security: [],
          parameters: [
            {
              name: 'token',
              in: 'query',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Email verification token',
            },
          ],
          responses: {
            200: {
              description: 'Email verified successfully',
            },
            404: {
              description: 'Invalid token',
            },
            500: {
              description: 'Internal server error',
            },
          },
        },
      },
      '/api/users/verify-otp': {
  post: {
    summary: 'Verify OTP',
    description: 'Verifies the OTP provided by the user for email verification. The OTP is valid for 5 minutes.',
    tags: ['Authentication'],
    security: [],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                example: 'user@example.com'
              },
              otp: {
                type: 'string',
                example: '578127'
              }
            },
            required: ['email', 'otp']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'OTP verified successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'OTP verified successfully'
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Bad Request. Email/OTP missing, OTP expired, or invalid OTP.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Invalid OTP'
                }
              }
            }
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'string',
              example: 'An error occurred during OTP verification'
            },
          },
        },
      },
    },
  },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
export default specs;