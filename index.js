require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./src/config/config');
const swaggerSpecs = require('./src/config/swagger');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Importar rutas
const indexRoutes = require('./src/routes/index');
const aiRoutes = require('./src/routes/ai');
const chatRoutes = require('./src/routes/chat');
const contextRoutes = require('./src/routes/context');

const app = express();
const port = config.port;

// Configurar proxy si está habilitado
if (config.proxy.trust) {
  app.set('trust proxy', config.proxy.count);
}

// Middlewares de seguridad y utilidades
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: config.cors.origin.split(','),
  methods: config.cors.methods.split(','),
  allowedHeaders: config.cors.allowedHeaders.split(','),
  credentials: true
}));

app.use(compression());

// Logging en desarrollo
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan(config.logging.format));
}

// Rate limiting general
app.use(generalLimiter);

// Parsers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gemini AI API Docs'
}));

// Rutas
app.use('/', indexRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/context', contextRoutes);

// Endpoint legacy para compatibilidad hacia atrás
app.get('/api', async (req, res, next) => {
  try {
    if (req.query.prompt) {
      // Redirigir a la nueva ruta con deprecation warning
      res.set('X-Deprecated', 'true');
      res.set('X-Deprecation-Message', 'Este endpoint está deprecado. Usa /api/ai en su lugar.');
      
      const geminiService = require('./src/services/geminiService');
      const response = await geminiService.generate(req.query.prompt.toString());
      
      res.json({
        request: req.query.prompt,
        response,
        warning: 'Este endpoint está deprecado. Usa /api/ai en su lugar.'
      });
    } else {
      res.status(400).json({
        error: 'Parámetro "prompt" requerido',
        example: '/api?prompt=Tu pregunta aquí',
        newEndpoint: '/api/ai'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor iniciado en puerto ${port}`);
  console.log(`📚 Documentación disponible en: http://localhost:${port}/api-docs`);
  console.log(`🌍 Entorno: ${config.nodeEnv}`);
  console.log(`🔒 Seguridad: helmet habilitado`);
  console.log(`⚡ Rate limiting: ${config.rateLimit.maxRequests} req/${Math.ceil(config.rateLimit.windowMs / 1000 / 60)} min`);
  console.log(`💾 Contexto: máximo ${config.context.maxMessages} mensajes por sesión`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.error('Error no manejado:', err.message);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err.message);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }
  process.exit(1);
});

