
# Gemini REST API

High-level REST API to interact with Google Gemini (Generative AI), with optional persistent conversation context, enhanced security, and live API documentation.

This repository is an opinionated starter for building serverless-friendly or containerized services that wrap a LLM (Gemini) with session/context support and production-ready middleware.

Highlights

- Optional persistent conversation context (MongoDB)
- Secure defaults: Helmet, CORS, rate limiting
- Interactive OpenAPI docs (Swagger UI)
- Chat-optimized endpoints and conversational helpers
- Input validation with celebrate/Joi (migrated from express-validator)
- Minimal external footprint to ease serverless deployments (includes pre-generated `public/swagger.json`)

Table of contents

- Features
- Requirements
- Quick start
- Environment variables
- Scripts
- API endpoints (summary)
- Examples
- Security & operational notes
- Deployment
- Project structure
- Changelog
- Contributing

Features

- Context persistence: optional session storage (MongoDB) to keep conversation history up to a configured size.
- Rate limiting: general and route-level limits to reduce abuse.
- Input validation: migrate to `celebrate` + `Joi` for robust request validation.
- OpenAPI: static `public/swagger.json` is included for serverless-friendly docs.

Requirements

- Node.js 16+
- Google Gemini API key (or configured equivalent)
- MongoDB (optional, only if you enable persistent sessions)

Quick start

1. Clone the repository:

```powershell
git clone "https://github.com/DANK1775/gemini-rest-api"
cd gemini-rest-api
```

2. Install dependencies:

```powershell
npm install
```

3. Copy and edit environment variables:

```powershell
copy .env.example .env
# then open .env and set values (GEMINIKEY, MONGODB_URI, etc.)
```

4. Run initialization script and start (development):

```powershell
npm run dev
```

Or in production:

```powershell
npm start
```

Scripts

- `npm run init` — initialize runtime artifacts (data folders, sample files)
- `npm run build:swagger` — regenerate `public/swagger.json` from internal spec (kept static for serverless)
- `npm run build` — alias for `build:swagger`
- `npm run dev` — run init + nodemon server
- `npm start` — run init + production server

API Endpoints (summary)

Note: full OpenAPI specification available at `/api-docs` (Swagger UI) and shipped in `public/swagger.json`.

- GET / — basic info (legacy)
- GET /health — health check
- GET /api-docs — interactive Swagger UI

AI endpoints
- GET /api/ai?prompt=...&sessionId=...&useContext=... — generate response (query)
- POST /api/ai — generate response (JSON body)

Chat
- POST /api/chat — chat endpoint with optional sessionId to persist or resume context

Context management
- GET /api/context — list sessions (if persistence enabled)
- GET /api/context/:sessionId — get session context
- GET /api/context/:sessionId/stats — session stats
- DELETE /api/context/:sessionId — delete session context

Examples

Generate a response (POST):

```powershell
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain reinforcement learning in simple terms",
    "sessionId": "session_123",
    "useContext": true
  }'
```

Send a chat message:

```powershell
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"user_1"}'
```

Security & operational notes

- Rate limiting defaults (configurable): general and specialized limits on AI routes.
- Helmet is enabled with CSP and other secure headers.
- CORS is configurable via environment variables.
- Input validation migrated from `express-validator` to `celebrate` + `Joi` for clearer schemas and better integration.
- The repository includes a pre-generated `public/swagger.json` to make static documentation available in serverless environments (Vercel, Netlify, etc.).

Environment variables

Set these in `.env` or in your deployment environment:

| VARIABLE | REQUIRED | DESCRIPTION | DEFAULT |
|---|---:|---|---|
| GEMINIKEY | yes | Google Gemini API key or equivalent | - |
| PORT | no | Server port | 3000 |
| NODE_ENV | no | Node environment | development |
| MONGODB_URI | no | MongoDB connection string (if enabling persistence) | - |
| RATE_LIMIT_WINDOW_MS | no | Rate limiting window (ms) | 900000 |
| RATE_LIMIT_MAX_REQUESTS | no | Max requests per window | 100 |
| MAX_CONTEXT_MESSAGES | no | Max messages per session | 100 |
| TRUST_PROXY | no | Set to true if behind a proxy | false |
| CORS_ORIGIN | no | Comma-separated list of allowed origins | * |

Project structure

```
gemini-rest-api/
├── api/                      # Production entrypoint and server
├── public/                   # Static assets, includes swagger.json
├── src/
│   ├── config/              # config.js, swagger spec (static)
│   ├── middleware/          # error handling, rate limiting, validators
│   ├── routes/              # express routes (ai, chat, context)
│   ├── services/            # business logic (gemini & context)
│   └── scripts/             # init and swagger generation helpers
├── data/                    # optional local json store
├── package.json
└── README.md
```

Deployment

Vercel

1. Add environment variables in the Vercel dashboard (GEMINIKEY, MONGODB_URI, etc.)
2. Deploy using Vercel CLI or GitHub integration. Static `public/swagger.json` will be served automatically.

Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Local development

```powershell
npm run dev
```

Testing & debugging

- The project has no automated tests configured by default. Add unit/integration tests for critical services.
- Use `NODE_ENV=development` for verbose logs (morgan) and easier debugging.

Changelog

### v1.5.0 (unreleased)

- Replaced dynamic Swagger generation with a static OpenAPI spec and included `public/swagger.json` to support serverless deployments.
- Migrated request validation from `express-validator` to `celebrate` + `Joi` for clearer schemas and safer parsing.
- Added celebrate error handler integration into the Express app to return well-formed validation errors.
- Removed `swagger-jsdoc` and `express-validator` from dependencies; added `celebrate` and `joi`.
- Updated `package-lock.json` and audited dependencies; `npm audit` reports no remaining vulnerabilities after the changes.
- Updated `.gitignore` to allow committing `public/swagger.json` and `package-lock.json` for reproducible installs and serverless docs.

### v1.0.0

- Initial feature set: optional context persistence, security middleware, Swagger docs, chat endpoints, rate limiting and error handling.

Contributing

1. Fork the project
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes and push
4. Open a pull request and describe the changes

License

ISC

Author

DANK1775 — https://github.com/DANK1775

