# Gemini REST API

API REST para interactuar con Google Gemini AI con contexto persistente, seguridad mejorada y documentación completa.

## 🚀 Características

- **Contexto Persistente**: Mantiene hasta 100 mensajes por sesión usando `json-store`
- **Seguridad Mejorada**: Implementa helmet, CORS, rate limiting y validación de entrada
- **Documentación Interactiva**: Swagger UI integrado
- **Chat Conversacional**: Endpoint optimizado para conversaciones naturales
- **Validación Robusta**: Validación de entrada con `express-validator`
- **Manejo de Errores**: Sistema robusto de manejo de errores
- **Rate Limiting**: Límites configurables para prevenir abuso
- **Proxy Ready**: Configurado para funcionar detrás de proxies

## 📋 Requisitos

- Node.js 16+
- API Key de Google Gemini AI
- NPM o Yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd gemini-rest-api
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus configuraciones:
   ```env
   GEMINIKEY=tu_api_key_de_gemini
   PORT=3000
   NODE_ENV=production
   # ... otras configuraciones
   ```

4. **Inicializar y arrancar**
   ```bash
   npm start
   ```

## 🔧 Scripts Disponibles

- `npm start` - Inicializa y arranca el servidor en producción
- `npm run dev` - Inicializa y arranca en modo desarrollo con nodemon
- `npm run init` - Solo ejecuta la inicialización

## 📖 API Endpoints

### General

- `GET /` - Información general de la API
- `GET /health` - Health check del servicio
- `GET /api-docs` - Documentación Swagger interactiva

### IA

- `GET /api/ai?prompt=<mensaje>&sessionId=<id>&useContext=<boolean>` - Generar respuesta
- `POST /api/ai` - Generar respuesta (método POST)

### Chat Conversacional

- `POST /api/chat` - Chat optimizado con historial completo

### Gestión de Contexto

- `GET /api/context` - Listar todas las sesiones
- `GET /api/context/:sessionId` - Obtener contexto de una sesión
- `GET /api/context/:sessionId/stats` - Estadísticas de una sesión
- `DELETE /api/context/:sessionId` - Limpiar contexto de una sesión

### Compatibilidad (Deprecado)

- `GET /api?prompt=<mensaje>` - Endpoint legacy (deprecado)

## 📝 Ejemplos de Uso

### Chat Básico

```bash
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hola, ¿cómo estás?",
    "sessionId": "mi_sesion_123"
  }'
```

### Generar Respuesta con Contexto

```bash
curl -X POST http://localhost:3000/api/ai \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Continúa la conversación anterior",
    "sessionId": "mi_sesion_123",
    "useContext": true
  }'
```

### Obtener Estadísticas de Sesión

```bash
curl http://localhost:3000/api/context/mi_sesion_123/stats
```

## 🔒 Configuración de Seguridad

### Rate Limiting

- General: 100 requests por 15 minutos
- IA: 10 requests por minuto
- Contexto: 5 operaciones por minuto

### Headers de Seguridad

- Helmet activado con CSP configurado
- CORS configurable
- Compresión habilitada

### Validación

- Validación de entrada en todos los endpoints
- Sanitización de datos
- Límites de longitud de mensajes

## 🌐 Configuración para Proxy

La API está configurada para funcionar detrás de proxies:

```env
TRUST_PROXY=true
PROXY_COUNT=1
```

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

Los logs incluyen:
- Requests HTTP (Morgan)
- Errores del sistema
- Información de inicialización

## 🔧 Variables de Entorno

| Variable | Requerida | Descripción | Valor por defecto |
|----------|-----------|-------------|-------------------|
| `GEMINIKEY` | ✅ | API Key de Google Gemini | - |
| `PORT` | ❌ | Puerto del servidor | 3000 |
| `NODE_ENV` | ❌ | Entorno de ejecución | development |
| `RATE_LIMIT_WINDOW_MS` | ❌ | Ventana de rate limiting (ms) | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | Máximo requests por ventana | 100 |
| `MAX_CONTEXT_MESSAGES` | ❌ | Máximo mensajes en contexto | 100 |
| `TRUST_PROXY` | ❌ | Confiar en proxy | false |
| `CORS_ORIGIN` | ❌ | Orígenes CORS permitidos | * |

## 📁 Estructura del Proyecto

```
gemini-rest-api/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── swagger.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validators.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── ai.js
│   │   ├── chat.js
│   │   └── context.js
│   ├── services/
│   │   ├── contextService.js
│   │   └── geminiService.js
│   ├── scripts/
│   │   └── init.js
│   └── utils/
│       └── helpers.js
├── data/
│   └── context.json
├── index.js
├── package.json
├── .env.example
└── README.md
```

## 🚀 Despliegue

### Vercel

El proyecto incluye `vercel.json` configurado. Solo necesitas:

1. Configurar las variables de entorno en Vercel
2. Deploy usando `vercel --prod`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2

```bash
pm2 start index.js --name "gemini-api"
```

## 🐛 Depuración

1. **Verificar configuración**: `npm run init`
2. **Logs detallados**: Establecer `NODE_ENV=development`
3. **Health check**: Visitar `/health`
4. **Documentación**: Visitar `/api-docs`

## 📄 Licencia

ISC

## 👨‍💻 Autor

**DANK1775**
- GitHub: [@DANK1775](https://github.com/DANK1775)
- Discord: dank.js

## 🤝 Contributors

**manalejandro**
- GitHub: [@manalejandro](https://github.com/manalejandro)


## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Changelog

### v1.0.0

- ✅ Contexto persistente con json-store
- ✅ Seguridad mejorada con helmet y rate limiting
- ✅ Validación robusta con express-validator
- ✅ Documentación Swagger completa
- ✅ Chat conversacional optimizado
- ✅ Gestión avanzada de errores
- ✅ Configuración para proxies
- ✅ Scripts de inicialización
- ✅ Endpoints de monitoreo
