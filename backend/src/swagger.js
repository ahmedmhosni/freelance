const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Roastify API',
      version: '1.0.0',
      description: 'Freelance Management Platform API Documentation',
      contact: {
        name: 'Roastify Support',
        email: 'support@roastify.com',
        url: 'https://roastify.online',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://roastify.online',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Acme Corp' },
            email: { type: 'string', example: 'contact@acme.com' },
            phone: { type: 'string', example: '+1234567890' },
            company: { type: 'string', example: 'Acme Corporation' },
            notes: { type: 'string', example: 'Important client' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Website Redesign' },
            description: {
              type: 'string',
              example: 'Complete website overhaul',
            },
            client_id: { type: 'integer', example: 1 },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'on-hold', 'cancelled'],
              example: 'active',
            },
            deadline: { type: 'string', format: 'date', example: '2024-12-31' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Design homepage' },
            description: {
              type: 'string',
              example: 'Create mockups for homepage',
            },
            project_id: { type: 'integer', example: 1 },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'review', 'done'],
              example: 'in-progress',
            },
            due_date: { type: 'string', format: 'date', example: '2024-01-31' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            invoice_number: { type: 'string', example: 'INV-0001' },
            client_id: { type: 'integer', example: 1 },
            project_id: { type: 'integer', example: 1 },
            amount: { type: 'number', format: 'decimal', example: 1500.0 },
            status: {
              type: 'string',
              enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
              example: 'sent',
            },
            due_date: { type: 'string', format: 'date', example: '2024-02-15' },
            notes: { type: 'string', example: 'Payment terms: Net 30' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            code: { type: 'string', example: 'ERROR_CODE' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
