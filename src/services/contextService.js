const Session = require('../models/Session');
const config = require('../config/config');
const database = require('../config/database');

class ContextService {
  constructor() {
    this.maxMessages = config.context.maxMessages;
    this.sessionsEnabled = config.context.enableSessions;
  }

  /**
   * Verificar si las sesiones están habilitadas
   * @returns {boolean}
   */
  areSessionsEnabled() {
    return this.sessionsEnabled;
  }

  /**
   * Obtener o crear una sesión
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<Object>} Sesión de MongoDB
   */
  async getOrCreateSession(sessionId) {
    if (!this.sessionsEnabled) {
      return null;
    }

    if (!database.isConnected) {
      throw new Error('Base de datos no conectada');
    }

    try {
      let session = await Session.findOne({ sessionId });
      
      if (!session) {
        session = new Session({
          sessionId,
          messages: [],
          metadata: {
            totalMessages: 0,
            userMessages: 0,
            assistantMessages: 0
          }
        });
        await session.save();
      }
      
      return session;
    } catch (error) {
      console.error('Error obteniendo/creando sesión:', error);
      throw new Error('Error al gestionar la sesión');
    }
  }

  /**
   * Obtener el contexto de una sesión
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<Array>} Array de mensajes del contexto
   */
  async getContext(sessionId) {
    if (!this.sessionsEnabled) {
      return [];
    }

    try {
      const session = await Session.findOne({ sessionId });
      return session ? session.messages : [];
    } catch (error) {
      console.error('Error obteniendo contexto:', error);
      return [];
    }
  }

  /**
   * Agregar un mensaje al contexto de una sesión
   * @param {string} sessionId - ID de la sesión
   * @param {string} role - Rol del mensaje ('user' o 'assistant')
   * @param {string} content - Contenido del mensaje
   * @returns {Promise<Object>} Sesión actualizada
   */
  async addMessage(sessionId, role, content) {
    if (!this.sessionsEnabled) {
      return null;
    }

    try {
      let session = await this.getOrCreateSession(sessionId);
      if (!session) return null;

      session.addMessage(role, content, this.maxMessages);
      await session.save();
      
      return session;
    } catch (error) {
      console.error('Error agregando mensaje:', error);
      throw new Error('Error al agregar mensaje al contexto');
    }
  }

  /**
   * Limpiar el contexto de una sesión
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<boolean>} Éxito de la operación
   */
  async clearContext(sessionId) {
    if (!this.sessionsEnabled) {
      return false;
    }

    try {
      const result = await Session.deleteOne({ sessionId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error limpiando contexto:', error);
      throw new Error('Error al limpiar el contexto');
    }
  }

  /**
   * Obtener todas las sesiones
   * @param {number} limit - Límite de resultados
   * @param {number} skip - Número de resultados a omitir
   * @returns {Promise<Object>} Objeto con todas las sesiones
   */
  async getAllSessions(limit = 50, skip = 0) {
    if (!this.sessionsEnabled) {
      return { sessions: [], total: 0 };
    }

    try {
      const sessions = await Session.find({})
        .sort({ lastActivity: -1 })
        .limit(limit)
        .skip(skip)
        .select('sessionId createdAt lastActivity metadata');

      const total = await Session.countDocuments({});

      return {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          totalMessages: session.metadata.totalMessages,
          userMessages: session.metadata.userMessages,
          assistantMessages: session.metadata.assistantMessages
        })),
        total,
        limit,
        skip
      };
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw new Error('Error al obtener las sesiones');
    }
  }

  /**
   * Obtener estadísticas del contexto
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<Object>} Estadísticas de la sesión
   */
  async getSessionStats(sessionId) {
    if (!this.sessionsEnabled) {
      return {
        sessionId,
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        maxMessages: this.maxMessages,
        firstMessage: null,
        lastMessage: null,
        sessionsEnabled: false
      };
    }

    try {
      const session = await Session.findOne({ sessionId });
      
      if (!session) {
        return {
          sessionId,
          totalMessages: 0,
          userMessages: 0,
          assistantMessages: 0,
          maxMessages: this.maxMessages,
          firstMessage: null,
          lastMessage: null,
          sessionsEnabled: true
        };
      }

      const stats = session.getStats();
      return {
        ...stats,
        maxMessages: this.maxMessages,
        sessionsEnabled: true
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas de la sesión');
    }
  }

  /**
   * Formatear el contexto para enviarlo a Gemini
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<string>} Contexto formateado
   */
  async formatContextForGemini(sessionId) {
    if (!this.sessionsEnabled) {
      return '';
    }

    try {
      const session = await Session.findOne({ sessionId });
      return session ? session.formatContextForGemini() : '';
    } catch (error) {
      console.error('Error formateando contexto:', error);
      return '';
    }
  }

  /**
   * Limpiar sesiones antiguas
   * @param {number} daysOld - Días de antigüedad
   * @returns {Promise<number>} Número de sesiones eliminadas
   */
  async cleanOldSessions(daysOld = 30) {
    if (!this.sessionsEnabled) {
      return 0;
    }

    try {
      const result = await Session.cleanOldSessions(daysOld);
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error limpiando sesiones antiguas:', error);
      throw new Error('Error al limpiar sesiones antiguas');
    }
  }

  /**
   * Obtener estadísticas generales del sistema
   * @returns {Promise<Object>} Estadísticas generales
   */
  async getSystemStats() {
    if (!this.sessionsEnabled) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        avgMessagesPerSession: 0,
        oldestSession: null,
        newestSession: null,
        sessionsEnabled: false
      };
    }

    try {
      const totalSessions = await Session.countDocuments({});
      const pipeline = [
        {
          $group: {
            _id: null,
            totalMessages: { $sum: '$metadata.totalMessages' },
            avgMessages: { $avg: '$metadata.totalMessages' },
            oldestSession: { $min: '$createdAt' },
            newestSession: { $max: '$createdAt' }
          }
        }
      ];

      const [stats] = await Session.aggregate(pipeline);

      return {
        totalSessions,
        totalMessages: stats?.totalMessages || 0,
        avgMessagesPerSession: Math.round(stats?.avgMessages || 0),
        oldestSession: stats?.oldestSession || null,
        newestSession: stats?.newestSession || null,
        sessionsEnabled: true
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error);
      throw new Error('Error al obtener estadísticas del sistema');
    }
  }
}

module.exports = new ContextService();
