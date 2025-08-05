/**
 * Generar un ID de sesión único
 * @returns {string} ID de sesión único
 */
const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${random}`;
};

/**
 * Validar formato de ID de sesión
 * @param {string} sessionId - ID de sesión a validar
 * @returns {boolean} Verdadero si es válido
 */
const isValidSessionId = (sessionId) => {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return typeof sessionId === 'string' && 
         sessionId.length >= 1 && 
         sessionId.length <= 100 && 
         regex.test(sessionId);
};

/**
 * Limpiar y sanitizar texto
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  
  // Remover caracteres de control y espacios extra
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    .replace(/\s+/g, ' ') // Multiple spaces
    .trim();
};

/**
 * Formatear tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calcular tiempo transcurrido desde una fecha
 * @param {string|Date} startTime - Tiempo de inicio
 * @returns {string} Tiempo transcurrido formateado
 */
const getElapsedTime = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diff = now - start;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return 'menos de 1m';
};

/**
 * Validar configuración requerida
 * @param {Object} config - Objeto de configuración
 * @returns {Array} Array de errores de validación
 */
const validateConfig = (config) => {
  const errors = [];
  
  if (!config.geminiKey) {
    errors.push('GEMINIKEY environment variable is required');
  }
  
  if (!config.port || isNaN(config.port)) {
    errors.push('Valid PORT is required');
  }
  
  if (config.rateLimit.maxRequests <= 0) {
    errors.push('Rate limit max requests must be greater than 0');
  }
  
  if (config.context.maxMessages <= 0) {
    errors.push('Max context messages must be greater than 0');
  }
  
  // Validar configuración de MongoDB si las sesiones están habilitadas
  if (config.context.enableSessions) {
    if (!config.mongodb.uri) {
      errors.push('MONGODB_URI is required when sessions are enabled');
    }
    
    if (!config.mongodb.dbName) {
      errors.push('MONGODB_DB_NAME is required when sessions are enabled');
    }
  }
  
  return errors;
};

/**
 * Crear respuesta estándar de error
 * @param {string} message - Mensaje de error
 * @param {Array} details - Detalles adicionales del error
 * @returns {Object} Objeto de respuesta de error
 */
const createErrorResponse = (message, details = []) => {
  return {
    error: message,
    timestamp: new Date().toISOString(),
    ...(details.length > 0 && { details })
  };
};

/**
 * Crear respuesta estándar de éxito
 * @param {any} data - Datos de respuesta
 * @param {string} message - Mensaje opcional
 * @returns {Object} Objeto de respuesta de éxito
 */
const createSuccessResponse = (data, message = null) => {
  return {
    ...(message && { message }),
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  generateSessionId,
  isValidSessionId,
  sanitizeText,
  formatBytes,
  getElapsedTime,
  validateConfig,
  createErrorResponse,
  createSuccessResponse
};
