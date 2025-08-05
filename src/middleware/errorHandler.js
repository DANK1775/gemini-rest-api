const asyncHandler = require('express-async-handler');

// Middleware de manejo de errores global
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Joi o express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.details || err.message
    });
  }

  // Error de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: err.message
    });
  }

  // Error de autorización
  if (err.status === 401 || err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Acceso denegado'
    });
  }

  // Error de Gemini API
  if (err.message && err.message.includes('Gemini')) {
    return res.status(503).json({
      error: 'Servicio temporalmente no disponible',
      message: 'El servicio de IA está experimentando problemas'
    });
  }

  // Error genérico del servidor
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Error interno del servidor' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Wrapper para funciones async que maneja errores automáticamente
const asyncErrorHandler = (fn) => {
  return asyncHandler(fn);
};

module.exports = {
  errorHandler,
  notFound,
  asyncErrorHandler
};
