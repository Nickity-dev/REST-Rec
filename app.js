require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const { testConnection } = require('./config/db');

const app = express();
const port = Number(process.env.PORT) || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origem do front-end não autorizada pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api', require('./routes/commentRoutes'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada.'
  });
});

app.use((error, req, res, next) => {
  console.error('[ERROR]', error);

  if (error && error.message === 'Origem do front-end não autorizada pelo CORS') {
    return res.status(403).json({
      success: false,
      message: 'A origem do front-end não está autorizada.'
    });
  }

  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Ocorreu um erro interno no servidor.'
    : error.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    message
  });
});

async function startServer() {
  const dbReady = await testConnection();
  if (!dbReady) {
    console.warn('[WARN] Banco de dados indisponível. A API continuará iniciada, mas as operações que dependem do banco retornarão erro até que o MySQL esteja disponível.');
  }

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Documentação Swagger em http://localhost:${port}/api-docs`);
  });
}

startServer();

module.exports = app;