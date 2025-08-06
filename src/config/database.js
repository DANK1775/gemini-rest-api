const mongoose = require('mongoose');
const config = require('./config');

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Configuración de conexión
      const options = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      };

      this.connection = await mongoose.connect(config.mongodb.uri, options);
      this.isConnected = true;

      console.log(`✅ MongoDB conectado: ${config.mongodb.uri}`);

      // Manejar eventos de conexión
      mongoose.connection.on('error', (err) => {
        console.error('❌ Error de MongoDB:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB desconectado');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconectado');
        this.isConnected = true;
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('✅ MongoDB desconectado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error desconectando MongoDB:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', error: 'No hay conexión a MongoDB' };
      }

      // Ping simple a la base de datos
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        connection: this.getConnectionStatus(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
const database = new Database();

module.exports = database;
