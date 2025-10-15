const { celebrate, Joi, errors: celebrateErrors, Segments } = require('celebrate');

// Validaciones para el endpoint de IA (GET query)
const validateAiRequest = celebrate({
  [Segments.QUERY]: Joi.object({
    prompt: Joi.string().min(1).max(4000).required().trim().messages({
      'string.base': 'El prompt debe ser una cadena',
      'string.empty': 'El prompt es requerido',
      'string.min': 'El prompt debe tener al menos {#limit} caracteres',
      'string.max': 'El prompt debe tener como máximo {#limit} caracteres'
    }),
    sessionId: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).max(100).optional(),
    useContext: Joi.boolean().optional()
  })
});

// Validaciones para endpoints POST de IA (body)
const validateAiPostRequest = celebrate({
  [Segments.BODY]: Joi.object({
    prompt: Joi.string().min(1).max(4000).required().trim(),
    sessionId: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).max(100).optional(),
    useContext: Joi.boolean().optional()
  })
});

// Validaciones para operaciones de contexto (params)
const validateContextRequest = celebrate({
  [Segments.PARAMS]: Joi.object({
    sessionId: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).max(100).required()
  })
});

// Validación para chat con historial (body)
const validateChatRequest = celebrate({
  [Segments.BODY]: Joi.object({
    message: Joi.string().min(1).max(4000).required().trim(),
    sessionId: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).max(100).optional()
  })
});

// Exportamos un middleware para manejar errores de celebrate en las rutas
const handleValidationErrors = (err, req, res, next) => {
  // celebrate arroja un error específico que podemos formatear
  if (err && err.joi) {
    const details = err.joi.details.map(d => ({ field: d.path.join('.'), message: d.message, value: d.context && d.context.value }));
    return res.status(400).json({ error: 'Datos de entrada inválidos', details });
  }
  next(err);
};

module.exports = {
  validateAiRequest,
  validateAiPostRequest,
  validateContextRequest,
  validateChatRequest,
  handleValidationErrors,
  celebrateErrors
};
