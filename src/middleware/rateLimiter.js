const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60) + ' minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60) + ' minutos'
    });
  }
});

// Rate limiting más estricto para endpoints de IA
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 solicitudes por minuto para IA
  message: {
    error: 'Demasiadas solicitudes de IA desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes de IA desde esta IP, intenta de nuevo más tarde.',
      retryAfter: '1 minuto'
    });
  }
});

// Rate limiting para creación/limpieza de contexto
const contextLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 operaciones de contexto por minuto
  message: {
    error: 'Demasiadas operaciones de contexto desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas operaciones de contexto desde esta IP, intenta de nuevo más tarde.',
      retryAfter: '1 minuto'
    });
  }
});

module.exports = {
  generalLimiter,
  aiLimiter,
  contextLimiter
};
