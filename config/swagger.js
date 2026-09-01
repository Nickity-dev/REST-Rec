const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HelpDesk API',
      version: '1.0.0',
      description: 'API REST para gestão de chamados e suporte técnico.'
    },
    servers: [
      {
        url: 'https://rest-rec-1.onrender.com',
        description: 'Servidor de produção (Render)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT recebido após autenticação.'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerSpec };