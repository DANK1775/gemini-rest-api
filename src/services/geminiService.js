const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const config = require('../config/config');
const contextService = require('./contextService');

class GeminiService {
  constructor() {
    if (!config.geminiKey) {
      throw new Error('GEMINIKEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(config.geminiKey);
    
    this.generationConfig = {
      temperature: 0.8,
      topK: 15,
      topP: 1,
    };

    this.safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings
    });
  }

  /**
   * Generar respuesta con contexto opcional
   * @param {string} prompt - Prompt del usuario
   * @param {string} sessionId - ID de la sesión para mantener contexto (opcional)
   * @param {boolean} useContext - Si usar contexto (por defecto true si las sesiones están habilitadas)
   * @returns {Promise<Object>} Respuesta de Gemini con metadata
   */
  async generateWithContext(prompt, sessionId = null, useContext = null) {
    try {
      let contextHistory = '';
      let sessionUsed = null;
      
      // Determinar si usar contexto
      const shouldUseContext = useContext !== false && contextService.areSessionsEnabled() && sessionId;
      
      if (shouldUseContext) {
        // Obtener contexto previo
        contextHistory = await contextService.formatContextForGemini(sessionId);
        sessionUsed = sessionId;
        
        // Agregar mensaje del usuario al contexto
        await contextService.addMessage(sessionId, 'user', prompt);
      }
      
      // Construir prompt completo con contexto si está disponible
      const fullPrompt = contextHistory + `Usuario: ${prompt}`;

      // Generar respuesta
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();

      // Agregar respuesta del asistente al contexto si se está usando
      if (shouldUseContext) {
        await contextService.addMessage(sessionId, 'assistant', responseText);
      }

      return {
        response: responseText,
        sessionId: sessionUsed,
        contextUsed: shouldUseContext,
        sessionsEnabled: contextService.areSessionsEnabled()
      };
    } catch (error) {
      console.error('Error generating content with context:', error);
      throw new Error('Error al generar respuesta con contexto');
    }
  }

  /**
   * Generar respuesta sin contexto (modo legacy)
   * @param {string} prompt - Prompt del usuario
   * @returns {Promise<string>} Respuesta de Gemini
   */
  async generate(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Error al generar respuesta');
    }
  }

  /**
   * Generar respuesta con chat history para conversaciones más naturales
   * @param {string} prompt - Prompt del usuario
   * @param {string} sessionId - ID de la sesión (opcional)
   * @returns {Promise<Object>} Respuesta de Gemini con metadata
   */
  async chatWithHistory(prompt, sessionId = null) {
    try {
      let sessionUsed = null;
      let contextUsed = false;
      
      // Solo usar sesiones si están habilitadas y se proporciona sessionId
      if (contextService.areSessionsEnabled() && sessionId) {
        // Obtener contexto como array de mensajes
        const history = await contextService.getContext(sessionId);
        
        // Convertir el historial al formato esperado por Gemini
        const chatHistory = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        // Iniciar chat con historial
        const chat = this.model.startChat({
          history: chatHistory
        });

        // Enviar mensaje
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Agregar mensajes al contexto
        await contextService.addMessage(sessionId, 'user', prompt);
        await contextService.addMessage(sessionId, 'assistant', responseText);
        
        sessionUsed = sessionId;
        contextUsed = true;

        return {
          response: responseText,
          sessionId: sessionUsed,
          contextUsed,
          sessionsEnabled: true
        };
      } else {
        // Sin contexto - respuesta directa
        const responseText = await this.generate(prompt);
        
        return {
          response: responseText,
          sessionId: null,
          contextUsed: false,
          sessionsEnabled: contextService.areSessionsEnabled()
        };
      }
    } catch (error) {
      console.error('Error in chat with history:', error);
      throw new Error('Error en el chat con historial');
    }
  }

  /**
   * Obtener información sobre el servicio
   * @returns {Object} Información del servicio
   */
  getServiceInfo() {
    return {
      model: "gemini-2.0-flash-exp",
      sessionsEnabled: contextService.areSessionsEnabled(),
      maxContextMessages: config.context.maxMessages,
      generationConfig: this.generationConfig
    };
  }
}

module.exports = new GeminiService();
