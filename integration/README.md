# Canvas Editor & Open WebUI Integration

This directory contains shared files for integrating Canvas Editor with Open WebUI in a containerized environment.

## Overview

The integration provides a seamless authentication flow between Open WebUI and Canvas Editor, allowing users to navigate between the two services while maintaining their authenticated session.

## Directory Structure

```
integration/
├── auth-config.json       # Shared configuration
├── auth-helpers.js        # Shared utilities
├── environment.js         # Environment detection
└── cors.js                # CORS utilities
```

## Setup Instructions

1. **Docker Compose Setup**

   The `docker-compose.yml` file in the root directory configures both services with shared volumes and networking.

   ```bash
   docker-compose up -d
   ```

2. **Environment Variables**

   Set the following environment variables in your Docker Compose file:

   - `JWT_SECRET`: A secure secret for JWT token generation
   - `EDITOR_SERVICE_URL`: URL for the Canvas Editor service
   - `OPENWEBUI_SERVICE_URL`: URL for the Open WebUI service

3. **Testing the Integration**

   After starting the containers, you can test the authentication flow:

   ```bash
   # Test OpenWebUI validation endpoint
   curl -X GET http://localhost:8080/api/v1/auth/validate \
     -H "Authorization: Bearer test_token" \
     -i

   # Test Editor return validation
   curl -X POST http://localhost:3000/api/validate-return \
     -H "Content-Type: application/json" \
     -d '{"token":"EDITOR_TOKEN_FOR_user123_1679000000000_EXP_1679003600000"}' \
     -i
   ```

## Authentication Flow

1. User logs in to Open WebUI
2. User clicks "Editor" button in Open WebUI
3. Open WebUI sends JWT token to Canvas Editor
4. Canvas Editor validates token with Open WebUI
5. Canvas Editor creates a session
6. User can return to Open WebUI via the "Return" button

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container cannot resolve hostnames | Check Docker network settings |
| CORS errors | Verify CORS headers in API endpoints |
| Authentication failures | Check JWT secret consistency |
| Missing environment variables | Ensure all required env vars are set |
| Connection timeouts | Increase timeout values, implement retry logic |

## Security Considerations

- Use strong JWT secrets
- Implement short token lifetimes
- Add CSRF protection to all forms
- Use Content Security Policy
- Run containers with minimal privileges