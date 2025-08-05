require('dotenv').config();

const config = {
  // Configuración del servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Key de Gemini
  geminiKey: process.env.GEMINIKEY,
  
  // Configuración de seguridad
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,X-Requested-With',
  },
  
  // Proxy
  proxy: {
    trust: process.env.TRUST_PROXY === 'true',
    count: parseInt(process.env.PROXY_COUNT) || 1,
  },
  
  // Contexto
  context: {
    maxMessages: parseInt(process.env.MAX_CONTEXT_MESSAGES) || 100,
    filePath: process.env.CONTEXT_FILE_PATH || './data/context.json',
  },
  
  // Swagger
  swagger: {
    title: process.env.SWAGGER_TITLE || 'Gemini AI REST API',
    description: process.env.SWAGGER_DESCRIPTION || 'API REST para interactuar con Gemini AI manteniendo contexto',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    basePath: process.env.SWAGGER_BASE_PATH || '/api',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
};

module.exports = config;
