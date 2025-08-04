const { body, query, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para el endpoint de IA
const validateAiRequest = [
  query('prompt')
    .notEmpty()
    .withMessage('El prompt es requerido')
    .isLength({ min: 1, max: 4000 })
    .withMessage('El prompt debe tener entre 1 y 4000 caracteres')
    .trim()
    .escape(),
  
  query('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El sessionId debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El sessionId solo puede contener letras, números, guiones y guiones bajos')
    .trim(),
  
  query('useContext')
    .optional()
    .isBoolean()
    .withMessage('useContext debe ser un booleano')
    .toBoolean(),
  
  handleValidationErrors
];

// Validaciones para endpoints POST de IA
const validateAiPostRequest = [
  body('prompt')
    .notEmpty()
    .withMessage('El prompt es requerido')
    .isLength({ min: 1, max: 4000 })
    .withMessage('El prompt debe tener entre 1 y 4000 caracteres')
    .trim()
    .escape(),
  
  body('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El sessionId debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El sessionId solo puede contener letras, números, guiones y guiones bajos')
    .trim(),
  
  body('useContext')
    .optional()
    .isBoolean()
    .withMessage('useContext debe ser un booleano')
    .toBoolean(),
  
  handleValidationErrors
];

// Validaciones para operaciones de contexto
const validateContextRequest = [
  param('sessionId')
    .notEmpty()
    .withMessage('El sessionId es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El sessionId debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El sessionId solo puede contener letras, números, guiones y guiones bajos')
    .trim(),
  
  handleValidationErrors
];

// Validación para chat con historial
const validateChatRequest = [
  body('message')
    .notEmpty()
    .withMessage('El mensaje es requerido')
    .isLength({ min: 1, max: 4000 })
    .withMessage('El mensaje debe tener entre 1 y 4000 caracteres')
    .trim()
    .escape(),
  
  body('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El sessionId debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('El sessionId solo puede contener letras, números, guiones y guiones bajos')
    .trim(),
  
  handleValidationErrors
];

module.exports = {
  validateAiRequest,
  validateAiPostRequest,
  validateContextRequest,
  validateChatRequest,
  handleValidationErrors
};
