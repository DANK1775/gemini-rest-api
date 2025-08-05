const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware/errorHandler');
const { validateAiRequest, validateAiPostRequest } = require('../middleware/validators');
const { aiLimiter } = require('../middleware/rateLimiter');
const geminiService = require('../services/geminiService');

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Endpoints para interactuar con Gemini AI
 */

/**
 * @swagger
 * /api/ai:
 *   get:
 *     summary: Genera respuesta de IA usando GET
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: prompt
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 4000
 *         description: Prompt para enviar a Gemini AI
 *         example: "¿Cuál es la capital de Francia?"
 *       - in: query
 *         name: sessionId
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^[a-zA-Z0-9_-]+$
 *           maxLength: 100
 *         description: ID de sesión para mantener contexto
 *         example: "user123_session"
 *       - in: query
 *         name: useContext
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Si usar contexto de conversación
 *         example: true
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', 
  aiLimiter,
  validateAiRequest,
  asyncErrorHandler(async (req, res) => {
    const { prompt, sessionId, useContext } = req.query;
    
    const result = await geminiService.generateWithContext(prompt, sessionId, useContext);

    res.json({
      request: prompt,
      response: result.response,
      sessionId: result.sessionId,
      contextUsed: result.contextUsed,
      sessionsEnabled: result.sessionsEnabled,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/ai:
 *   post:
 *     summary: Genera respuesta de IA usando POST
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4000
 *                 description: Prompt para enviar a Gemini AI
 *                 example: "Explícame qué es el machine learning"
 *               sessionId:
 *                 type: string
 *                 pattern: ^[a-zA-Z0-9_-]+$
 *                 maxLength: 100
 *                 description: ID de sesión para mantener contexto
 *                 example: "user123_session"
 *               useContext:
 *                 type: boolean
 *                 default: true
 *                 description: Si usar contexto de conversación
 *                 example: true
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/',
  aiLimiter,
  validateAiPostRequest,
  asyncErrorHandler(async (req, res) => {
    const { prompt, sessionId, useContext } = req.body;
    
    const result = await geminiService.generateWithContext(prompt, sessionId, useContext);

    res.json({
      request: prompt,
      response: result.response,
      sessionId: result.sessionId,
      contextUsed: result.contextUsed,
      sessionsEnabled: result.sessionsEnabled,
      timestamp: new Date().toISOString()
    });
  })
);

module.exports = router;
