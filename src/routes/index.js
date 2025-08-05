const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: General
 *   description: Endpoints generales de la API
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información general de la API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info:
 *                   type: string
 *                   example: "API REST de Gemini AI con contexto persistente y seguridad mejorada"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 author:
 *                   type: string
 *                   example: "GH: DANK1775 | DC: dank.js"
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Contexto persistente", "Rate limiting", "Validación de entrada", "Documentación Swagger"]
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     ai:
 *                       type: string
 *                       example: "/api/ai"
 *                     chat:
 *                       type: string
 *                       example: "/api/chat"
 *                     context:
 *                       type: string
 *                       example: "/api/context"
 *                     docs:
 *                       type: string
 *                       example: "/api-docs"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  res.json({
    info: 'API REST de Gemini AI con contexto persistente y seguridad mejorada',
    version: '1.0.0',
    author: 'GH: DANK1775 | DC: dank.js',
    features: [
      'Contexto persistente con json-store',
      'Rate limiting configurable',
      'Validación de entrada con express-validator',
      'Seguridad mejorada con helmet',
      'Documentación interactiva con Swagger',
      'Manejo de errores robusto',
      'Chat conversacional con historial'
    ],
    endpoints: {
      ai: '/api/ai',
      chat: '/api/chat',
      context: '/api/context',
      docs: '/api-docs'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificación de salud del servicio
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Estado del servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 uptime:
 *                   type: number
 *                   description: Tiempo activo en segundos
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     connected:
 *                       type: boolean
 *                 sessions:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 */
router.get('/health', async (req, res) => {
  const database = require('../config/database');
  const contextService = require('../services/contextService');
  
  let dbHealth = { status: 'disabled', connected: false };
  
  if (contextService.areSessionsEnabled()) {
    dbHealth = await database.healthCheck();
  }

  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    sessions: {
      enabled: contextService.areSessionsEnabled()
    }
  });
});

module.exports = router;
