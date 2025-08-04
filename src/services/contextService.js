const JsonStore = require('json-store');
const path = require('path');
const config = require('../config/config');

class ContextService {
  constructor() {
    const contextPath = path.resolve(config.context.filePath);
    this.store = JsonStore(contextPath);
    this.maxMessages = config.context.maxMessages;
    
    // Inicializar el store si no existe
    if (!this.store.get('sessions')) {
      this.store.set('sessions', {});
    }
  }

  /**
   * Obtener el contexto de una sesión
   * @param {string} sessionId - ID de la sesión
   * @returns {Array} Array de mensajes del contexto
   */
  getContext(sessionId) {
    const sessions = this.store.get('sessions') || {};
    return sessions[sessionId] || [];
  }

  /**
   * Agregar un mensaje al contexto de una sesión
   * @param {string} sessionId - ID de la sesión
   * @param {string} role - Rol del mensaje ('user' o 'assistant')
   * @param {string} content - Contenido del mensaje
   */
  addMessage(sessionId, role, content) {
    const sessions = this.store.get('sessions') || {};
    
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }

    const message = {
      role,
      content,
      timestamp: new Date().toISOString()
    };

    sessions[sessionId].push(message);

    // Mantener solo los últimos N mensajes
    if (sessions[sessionId].length > this.maxMessages) {
      sessions[sessionId] = sessions[sessionId].slice(-this.maxMessages);
    }

    this.store.set('sessions', sessions);
  }

  /**
   * Limpiar el contexto de una sesión
   * @param {string} sessionId - ID de la sesión
   */
  clearContext(sessionId) {
    const sessions = this.store.get('sessions') || {};
    delete sessions[sessionId];
    this.store.set('sessions', sessions);
  }

  /**
   * Obtener todas las sesiones
   * @returns {Object} Objeto con todas las sesiones
   */
  getAllSessions() {
    return this.store.get('sessions') || {};
  }

  /**
   * Obtener estadísticas del contexto
   * @param {string} sessionId - ID de la sesión
   * @returns {Object} Estadísticas de la sesión
   */
  getSessionStats(sessionId) {
    const context = this.getContext(sessionId);
    const userMessages = context.filter(msg => msg.role === 'user').length;
    const assistantMessages = context.filter(msg => msg.role === 'assistant').length;
    
    return {
      totalMessages: context.length,
      userMessages,
      assistantMessages,
      maxMessages: this.maxMessages,
      firstMessage: context.length > 0 ? context[0].timestamp : null,
      lastMessage: context.length > 0 ? context[context.length - 1].timestamp : null
    };
  }

  /**
   * Formatear el contexto para enviarlo a Gemini
   * @param {string} sessionId - ID de la sesión
   * @returns {string} Contexto formateado
   */
  formatContextForGemini(sessionId) {
    const context = this.getContext(sessionId);
    
    if (context.length === 0) {
      return '';
    }

    const formattedMessages = context.map(msg => {
      const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
      return `${role}: ${msg.content}`;
    }).join('\n\n');

    return `Contexto de la conversación anterior:\n\n${formattedMessages}\n\n---\n\n`;
  }
}

module.exports = new ContextService();
