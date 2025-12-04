/**
 * Swagger/OpenAPI Configuration
 * Defines API documentation structure and metadata
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Freelance Management API',
      version: '2.0.0',
      description: 'Comprehensive API for managing freelance projects, clients, tasks, invoices, and time tracking',
      contact: {
        name: 'API Support',
        email: 'support@freelancemanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.freelancemanagement.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              },
              description: 'Validation errors (if applicable)'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page'
            },
            offset: {
              type: 'integer',
              description: 'Number of items skipped'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'No token provided'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Access denied'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Validation failed',
                errors: [
                  {
                    field: 'email',
                    message: 'Please provide a valid email address'
                  }
                ]
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Internal server error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Clients',
        description: 'Client management endpoints'
      },
      {
        name: 'Projects',
        description: 'Project management endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints'
      },
      {
        name: 'Invoices',
        description: 'Invoice management endpoints'
      },
      {
        name: 'Time Tracking',
        description: 'Time entry and tracking endpoints'
      },
      {
        name: 'Reports',
        description: 'Analytics and reporting endpoints'
      },
      {
        name: 'Notifications',
        description: 'Notification management endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard data aggregation endpoints'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints'
      }
    ]
  },
  apis: [
    './src/modules/*/controllers/*.js',
    './src/modules/*/models/*.js',
    './src/docs/*.yaml',
    './src/docs/auth.yaml',
    './src/docs/clients.yaml',
    './src/docs/projects.yaml',
    './src/docs/tasks.yaml',
    './src/docs/invoices.yaml',
    './src/docs/time-tracking.yaml',
    './src/docs/reports.yaml',
    './src/docs/notifications.yaml',
    './src/docs/admin.yaml',
    './src/docs/dashboard.yaml'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
