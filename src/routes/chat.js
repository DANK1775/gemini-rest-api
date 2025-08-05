const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware/errorHandler');
const { validateChatRequest } = require('../middleware/validators');
const { aiLimiter } = require('../middleware/rateLimiter');
const geminiService = require('../services/geminiService');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Endpoints para chat conversacional con historial
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat conversacional con historial
 *     tags: [Chat]
 *     description: Endpoint optimizado para conversaciones naturales manteniendo el historial completo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Respuesta exitosa del chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mehttps://www.npmjs.com/package/json-storessage:
 *                   type: string
 *                   description: Mensaje del usuario
 *                 response:
 *                   type: string
 *                   description: Respuesta del asistente
 *                 sessionId:
 *                   type: string
 *                   description: ID de la sesión
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp de la respuesta
 *                 messageCount:
 *                   type: integer
 *                   description: Número total de mensajes en la sesión
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/',
  aiLimiter,
  validateChatRequest,
  asyncErrorHandler(async (req, res) => {
    const { message, sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } = req.body;
    
    const response = await geminiService.chatWithHistory(message, sessionId);
    
    // Obtener estadísticas de la sesión
    const contextService = require('../services/contextService');
    const stats = contextService.getSessionStats(sessionId);

    res.json({
      message,
      response,
      sessionId,
      timestamp: new Date().toISOString(),
      messageCount: stats.totalMessages
    });
  })
);

module.exports = router;
