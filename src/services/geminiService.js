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
   * Generar respuesta con contexto
   * @param {string} prompt - Prompt del usuario
   * @param {string} sessionId - ID de la sesión para mantener contexto
   * @returns {Promise<string>} Respuesta de Gemini
   */
  async generateWithContext(prompt, sessionId = 'default') {
    try {
      // Obtener contexto previo
      const contextHistory = contextService.formatContextForGemini(sessionId);
      
      // Construir prompt completo con contexto
      const fullPrompt = contextHistory + `Usuario: ${prompt}`;

      // Agregar mensaje del usuario al contexto
      contextService.addMessage(sessionId, 'user', prompt);

      // Generar respuesta
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();

      // Agregar respuesta del asistente al contexto
      contextService.addMessage(sessionId, 'assistant', responseText);

      return responseText;
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
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<string>} Respuesta de Gemini
   */
  async chatWithHistory(prompt, sessionId = 'default') {
    try {
      // Obtener contexto como array de mensajes
      const history = contextService.getContext(sessionId);
      
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
      contextService.addMessage(sessionId, 'user', prompt);
      contextService.addMessage(sessionId, 'assistant', responseText);

      return responseText;
    } catch (error) {
      console.error('Error in chat with history:', error);
      throw new Error('Error en el chat con historial');
    }
  }
}

module.exports = new GeminiService();
