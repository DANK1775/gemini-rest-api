const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
    index: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 10000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  _id: true
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    maxLength: 100
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    totalMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    assistantMessages: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

// Índices compuestos
sessionSchema.index({ sessionId: 1, 'messages.timestamp': -1 });
sessionSchema.index({ lastActivity: -1 });
sessionSchema.index({ createdAt: -1 });

// Middleware para actualizar lastActivity
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  
  // Actualizar contadores de metadata
  if (this.messages && this.messages.length > 0) {
    this.metadata.totalMessages = this.messages.length;
    this.metadata.userMessages = this.messages.filter(msg => msg.role === 'user').length;
    this.metadata.assistantMessages = this.messages.filter(msg => msg.role === 'assistant').length;
  }
  
  next();
});

// Método para agregar un mensaje
sessionSchema.methods.addMessage = function(role, content, maxMessages = 100) {
  const message = {
    role,
    content,
    timestamp: new Date()
  };
  
  this.messages.push(message);
  
  // Mantener solo los últimos N mensajes
  if (this.messages.length > maxMessages) {
    this.messages = this.messages.slice(-maxMessages);
  }
  
  this.lastActivity = new Date();
  return this;
};

// Método para obtener estadísticas
sessionSchema.methods.getStats = function() {
  const messages = this.messages || [];
  const userMessages = messages.filter(msg => msg.role === 'user').length;
  const assistantMessages = messages.filter(msg => msg.role === 'assistant').length;
  
  return {
    sessionId: this.sessionId,
    totalMessages: messages.length,
    userMessages,
    assistantMessages,
    firstMessage: messages.length > 0 ? messages[0].timestamp : null,
    lastMessage: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    createdAt: this.createdAt,
    lastActivity: this.lastActivity
  };
};

// Método para formatear contexto para Gemini
sessionSchema.methods.formatContextForGemini = function() {
  const messages = this.messages || [];
  
  if (messages.length === 0) {
    return '';
  }

  const formattedMessages = messages.map(msg => {
    const role = msg.role === 'user' ? 'Usuario' : 'Asistente';
    return `${role}: ${msg.content}`;
  }).join('\n\n');

  return `Contexto de la conversación anterior:\n\n${formattedMessages}\n\n---\n\n`;
};

// Método estático para limpiar sesiones antiguas
sessionSchema.statics.cleanOldSessions = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const result = await this.deleteMany({
    lastActivity: { $lt: cutoffDate }
  });
  
  return result;
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
