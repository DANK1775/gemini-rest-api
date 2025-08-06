const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware/errorHandler');
const { validateContextRequest } = require('../middleware/validators');
const { contextLimiter } = require('../middleware/rateLimiter');
const contextService = require('../services/contextService');

/**
 * @swagger
 * tags:
 *   name: Context
 *   description: Endpoints para gestionar el contexto de conversaciones
 */

/**
 * @swagger
 * /api/context/{sessionId}:
 *   get:
 *     summary: Obtener contexto de una sesión
 *     tags: [Context]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[a-zA-Z0-9_-]+$
 *           maxLength: 100
 *         description: ID de la sesión
 *         example: "user123_session"
 *     responses:
 *       200:
 *         description: Contexto de la sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: ID de la sesión
 *                 context:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [user, assistant]
 *                         description: Rol del mensaje
 *                       content:
 *                         type: string
 *                         description: Contenido del mensaje
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp del mensaje
 *                 stats:
 *                   $ref: '#/components/schemas/ContextStats'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:sessionId',
  validateContextRequest,
  asyncErrorHandler(async (req, res) => {
    const { sessionId } = req.params;
    
    if (!contextService.areSessionsEnabled()) {
      return res.status(400).json({
        error: 'Las sesiones están deshabilitadas',
        sessionsEnabled: false
      });
    }
    
    const context = await contextService.getContext(sessionId);
    const stats = await contextService.getSessionStats(sessionId);

    res.json({
      sessionId,
      context,
      stats
    });
  })
);

/**
 * @swagger
 * /api/context/{sessionId}/stats:
 *   get:
 *     summary: Obtener estadísticas de una sesión
 *     tags: [Context]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[a-zA-Z0-9_-]+$
 *           maxLength: 100
 *         description: ID de la sesión
 *         example: "user123_session"
 *     responses:
 *       200:
 *         description: Estadísticas de la sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: ID de la sesión
 *                 stats:
 *                   $ref: '#/components/schemas/ContextStats'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:sessionId/stats',
  validateContextRequest,
  asyncErrorHandler(async (req, res) => {
    const { sessionId } = req.params;
    
    if (!contextService.areSessionsEnabled()) {
      return res.status(400).json({
        error: 'Las sesiones están deshabilitadas',
        sessionsEnabled: false
      });
    }
    
    const stats = await contextService.getSessionStats(sessionId);

    res.json({
      sessionId,
      stats
    });
  })
);

/**
 * @swagger
 * /api/context/{sessionId}:
 *   delete:
 *     summary: Limpiar contexto de una sesión
 *     tags: [Context]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[a-zA-Z0-9_-]+$
 *           maxLength: 100
 *         description: ID de la sesión
 *         example: "user123_session"
 *     responses:
 *       200:
 *         description: Contexto limpiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contexto limpiado exitosamente"
 *                 sessionId:
 *                   type: string
 *                   description: ID de la sesión
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp de la operación
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:sessionId',
  contextLimiter,
  validateContextRequest,
  asyncErrorHandler(async (req, res) => {
    const { sessionId } = req.params;
    
    if (!contextService.areSessionsEnabled()) {
      return res.status(400).json({
        error: 'Las sesiones están deshabilitadas',
        sessionsEnabled: false
      });
    }
    
    const deleted = await contextService.clearContext(sessionId);

    res.json({
      message: deleted ? 'Contexto limpiado exitosamente' : 'Sesión no encontrada',
      sessionId,
      deleted,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/context:
 *   get:
 *     summary: Obtener todas las sesiones
 *     tags: [Context]
 *     responses:
 *       200:
 *         description: Lista de todas las sesiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           enum: [user, assistant]
 *                         content:
 *                           type: string
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                 totalSessions:
 *                   type: integer
 *                   description: Número total de sesiones
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/',
  asyncErrorHandler(async (req, res) => {
    if (!contextService.areSessionsEnabled()) {
      return res.json({
        message: 'Las sesiones están deshabilitadas',
        sessions: {},
        totalSessions: 0,
        sessionsEnabled: false,
        timestamp: new Date().toISOString()
      });
    }

    const { limit = 50, skip = 0 } = req.query;
    const result = await contextService.getAllSessions(parseInt(limit), parseInt(skip));

    res.json({
      ...result,
      sessionsEnabled: true,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/context/stats:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     tags: [Context]
 *     responses:
 *       200:
 *         description: Estadísticas generales del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 systemStats:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *                     avgMessagesPerSession:
 *                       type: number
 *                     oldestSession:
 *                       type: string
 *                       format: date-time
 *                     newestSession:
 *                       type: string
 *                       format: date-time
 *                     sessionsEnabled:
 *                       type: boolean
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats',
  asyncErrorHandler(async (req, res) => {
    const systemStats = await contextService.getSystemStats();

    res.json({
      systemStats,
      timestamp: new Date().toISOString()
    });
  })
);

module.exports = router;
