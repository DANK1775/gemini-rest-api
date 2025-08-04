#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { validateConfig, formatBytes } = require('../utils/helpers');

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

// Crear directorio de datos si no existe
const dataDir = path.dirname(config.context.filePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Directorio de datos creado: ${dataDir}`);
}

// Inicializar archivo de contexto si no existe
if (!fs.existsSync(config.context.filePath)) {
  const initialData = { sessions: {} };
  fs.writeFileSync(config.context.filePath, JSON.stringify(initialData, null, 2));
  console.log(`💾 Archivo de contexto inicializado: ${config.context.filePath}`);
}

// Mostrar información del sistema
console.log('\n🚀 Información del sistema:');
console.log(`   - Node.js: ${process.version}`);
console.log(`   - Entorno: ${config.nodeEnv}`);
console.log(`   - Puerto: ${config.port}`);
console.log(`   - Memoria: ${formatBytes(process.memoryUsage().heapUsed)}`);

// Mostrar configuración de seguridad
console.log('\n🔒 Configuración de seguridad:');
console.log(`   - Rate limiting: ${config.rateLimit.maxRequests} req/${Math.ceil(config.rateLimit.windowMs / 1000 / 60)} min`);
console.log(`   - CORS origin: ${config.cors.origin}`);
console.log(`   - Proxy trust: ${config.proxy.trust ? 'habilitado' : 'deshabilitado'}`);

// Mostrar configuración de contexto
console.log('\n💬 Configuración de contexto:');
console.log(`   - Máximo mensajes: ${config.context.maxMessages}`);
console.log(`   - Archivo: ${config.context.filePath}`);

console.log('\n✅ Inicialización completada. El servidor está listo para arrancar.');
console.log('📚 Documentación disponible en: /api-docs');
console.log('🏥 Health check disponible en: /health\n');
