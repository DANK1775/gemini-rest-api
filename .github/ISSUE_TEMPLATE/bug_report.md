---
name: Bug report
about: Create a report to help us improve the gemini-rest-api
title: "Bug: "
labels: bug
assignees: ''
---

<!-- Thank you for taking the time to file a bug. Please include as much information as you can. -->

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior (please provide exact, minimal steps). Include the endpoint, HTTP method, full URL (or service), request headers, query parameters and request body when relevant.

Example (API request):
1. Start the server locally: `npm start` or use the deployed URL `https://your-deployment.example`.
2. Send a request (example using curl):

```bash
curl -X POST 'http://localhost:3000/api/ai' \
	-H 'Content-Type: application/json' \
	-d '{"prompt":"Hello world","max_tokens":10}'
```

3. Observe the response and error (paste status code and body):

```
HTTP/1.1 500 Internal Server Error
{"error":"Internal Server Error","message":"Something went wrong"}
```

Helpful tips:
- If the bug happens only with specific input, paste the exact JSON or parameters.
- Include required headers (Authorization, Content-Type) and any test credentials or roles used.
- If the issue requires a sequence of actions (UI flow or multiple API calls), list them in order and include timestamps if possible.
- Attach relevant server logs, request IDs or stack traces (redact secrets).
- If the bug happens on a deployed environment, include the full URL and the deployment tag or commit SHA.

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Desktop (please complete the following information):**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 106]

**Smartphone (please complete the following information):**
- Device: [e.g. iPhone6]
- OS: [e.g. iOS 14]
- Browser: [e.g. Safari]
- Version: [e.g. 14]

**API (if applicable)**
- Endpoint: [e.g. POST /api/ai]
- Request body: (paste example JSON if relevant)
- Response status: [e.g. 500]
- Response body: (paste the response body or error)

**Logs / Error output**
If you have server logs, request traces or stack traces, please paste them here (redact secrets).

**Additional context**
Add any other context about the problem here.
