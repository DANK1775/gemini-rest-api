#!/usr/bin/env node

const config = require('../config/config');
const database = require('../config/database');
const { validateConfig, formatBytes } = require('../utils/helpers');

async function init() {
  console.log('🔧 Inicializando Gemini REST API...\n');

  // Validar configuración
  console.log('📋 Validando configuración...');
  const configErrors = validateConfig(config);

  if (configErrors.length > 0) {
    console.error('❌ Errores de configuración encontrados:');
    configErrors.forEach(error => console.error(`   - ${error}`));
    console.log('\n💡 Revisa tu archivo .env y asegúrate de que todas las variables estén configuradas correctamente.');
    process.exit(1);
  }

  console.log('✅ Configuración válida');

  // Conectar a MongoDB si las sesiones están habilitadas
  if (config.context.enableSessions) {
    console.log('🔌 Conectando a MongoDB...');
    try {
      await database.connect();
      console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error.message);
      console.log('⚠️  Las sesiones estarán deshabilitadas hasta que se resuelva la conexión');
    }
  } else {
    console.log('⚠️  Las sesiones están deshabilitadas en la configuración');
  }

  // Mostrar información del sistema
  console.log('\n🚀 Información del sistema:');
  console.log(`   - Node.js: ${process.version}`);
  console.log(`   - Entorno: ${config.nodeEnv}`);
  console.log(`   - Puerto: ${config.port}`);
  console.log(`   - Memoria: ${formatBytes(process.memoryUsage().heapUsed)}`);

  // Mostrar configuración de base de datos
  console.log('\n💾 Configuración de base de datos:');
  console.log(`   - MongoDB URI: ${config.mongodb.uri}`);
  console.log(`   - Base de datos: ${config.mongodb.dbName}`);
  console.log(`   - Sesiones habilitadas: ${config.context.enableSessions ? 'Sí' : 'No'}`);
  if (database.isConnected) {
    const status = database.getConnectionStatus();
    console.log(`   - Estado: Conectado (${status.host}:${status.port})`);
  } else {
    console.log(`   - Estado: Desconectado`);
  }

  // Mostrar configuración de seguridad
  console.log('\n🔒 Configuración de seguridad:');
  console.log(`   - Rate limiting: ${config.rateLimit.maxRequests} req/${Math.ceil(config.rateLimit.windowMs / 1000 / 60)} min`);
  console.log(`   - CORS origin: ${config.cors.origin}`);
  console.log(`   - Proxy trust: ${config.proxy.trust ? 'habilitado' : 'deshabilitado'}`);

  // Mostrar configuración de contexto
  console.log('\n💬 Configuración de contexto:');
  console.log(`   - Máximo mensajes: ${config.context.maxMessages}`);
  console.log(`   - Sesiones: ${config.context.enableSessions ? 'habilitadas' : 'deshabilitadas'}`);

  console.log('\n✅ Inicialización completada. El servidor está listo para arrancar.');
  console.log('📚 Documentación disponible en: /api-docs');
  console.log('🏥 Health check disponible en: /health');
  if (config.context.enableSessions) {
    console.log('📊 Estadísticas de contexto en: /api/context/stats');
  }
  console.log('');
}

// Ejecutar la función de inicialización
init().catch(error => {
  console.error('❌ Error durante la inicialización:', error);
  process.exit(1);
});
