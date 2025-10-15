const config = require('../config/config');

// Exportamos el objeto OpenAPI (estático) para no depender de swagger-jsdoc
const specs = {
  openapi: '3.0.0',
  info: {
    title: config.swagger.title,
    version: config.swagger.version,
    description: config.swagger.description,
    contact: {
      name: 'DANK1775',
      url: 'https://github.com/DANK1775',
    },
    license: { name: 'ISC' },
  },
  servers: [
    { url: `http://${config.swagger.host}`, description: 'Servidor de desarrollo' },
    { url: 'https://gemini-rest.vercel.app/', description: 'Servidor de producción' },
  ],
  components: {
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          request: { type: 'string', description: 'Prompt enviado por el usuario' },
          response: { type: 'string', description: 'Respuesta generada por Gemini AI' },
          sessionId: { type: 'string', description: 'ID de la sesión utilizada' },
          timestamp: { type: 'string', format: 'date-time', description: 'Timestamp de la respuesta' },
        },
      },
      ChatRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1, maxLength: 4000, description: 'Mensaje del usuario', example: '¿Cuál es la capital de Francia?' },
          sessionId: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$', maxLength: 100, description: 'ID de la sesión (opcional, se generará uno automático si no se proporciona)', example: 'user123_session' },
        },
      },
      ContextStats: {
        type: 'object',
        properties: {
          totalMessages: { type: 'integer', description: 'Total de mensajes en la sesión' },
          userMessages: { type: 'integer', description: 'Número de mensajes del usuario' },
          assistantMessages: { type: 'integer', description: 'Número de mensajes del asistente' },
          maxMessages: { type: 'integer', description: 'Máximo número de mensajes permitidos' },
          firstMessage: { type: 'string', format: 'date-time', description: 'Timestamp del primer mensaje' },
          lastMessage: { type: 'string', format: 'date-time', description: 'Timestamp del último mensaje' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Descripción del error' },
          details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string', description: 'Campo que causó el error' }, message: { type: 'string', description: 'Mensaje de error específico' }, value: { type: 'string', description: 'Valor que causó el error' } } } },
        },
      },
    },
    responses: {
      BadRequest: { description: 'Solicitud incorrecta', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      TooManyRequests: { description: 'Demasiadas solicitudes', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string', example: 'Demasiadas solicitudes desde esta IP' }, retryAfter: { type: 'string', example: '1 minuto' } } } } } },
      InternalServerError: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
    },
  },
  paths: {},
};

module.exports = specs;
