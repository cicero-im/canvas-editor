# Implementation Steps for Local Testing

Before proceeding with containerization, we'll test the integration locally. This ensures the core functionality works before adding the complexity of containers.

## Local Testing Plan

### 1. Shared Integration Directory Setup

```bash
# Create the shared integration directory structure
mkdir -p integration

# Create the configuration files
touch integration/auth-config.json
touch integration/auth-helpers.js
touch integration/environment.js
```

### 2. Create the Authentication Files

#### auth-config.json
```json
{
  "auth_endpoints": {
    "validate": "/api/v1/auth/validate",
    "return": "/api/v1/return"
  },
  "token_type": "JWT",
  "token_location": "localStorage",
  "token_key": "token",
  "shared_version": "1.0.0"
}
```

#### environment.js
```javascript
/**
 * Environment detection for local development
 */
export function getServiceUrls() {
  // For local testing
  return {
    openWebUIUrl: "http://localhost:8080",
    editorUrl: "http://localhost:3000"
  };
}

export function isProduction() {
  return false; // Local testing
}
```

#### auth-helpers.js
Implement the auth helpers as specified in the plan, adjusted for local testing.

### 3. OpenWebUI Implementation Steps

1. Create the API endpoints:
   - `/api/v1/auth/validate`
   - `/api/v1/return`

2. Add the Editor button component to the sidebar

3. Test the authentication flow

### 4. Canvas Editor Implementation Steps

1. Create the authentication endpoints:
   - `/auth` page
   - `/api/validate-return` endpoint

2. Add the return button component

3. Test the return journey

### 5. Local Testing Procedure

1. Start both services locally:
   ```bash
   # In the OpenWebUI directory
   npm run dev -- --port 8080

   # In the Canvas Editor directory
   npm run dev -- --port 3000
   ```

2. Test the authentication flow:
   - Log in to OpenWebUI
   - Click the Editor button
   - Verify you're authenticated in the Editor
   - Click the Return button
   - Verify you return to OpenWebUI with authentication intact

3. Test error scenarios:
   - Invalid tokens
   - Expired tokens
   - Network issues (simulate by stopping one service)

## Preparation for Containerization

After successful local testing, prepare for containerization:

1. Create Dockerfiles for both services
2. Set up the Docker Compose configuration
3. Configure the shared volume
4. Update environment detection for container networking

## Integration with Canvas Editor

When implementing with Canvas Editor specifically:

1. Identify where authentication can be added in the current codebase
2. Add the return button to the Canvas Editor UI
3. Ensure the editor properly handles the authentication token
4. Update the styling to use the shared color palette

## Color Palette Integration

1. Implement the color palette variables in both applications
2. Apply the styling to the authentication components
3. Ensure visual consistency across both applications

## Error Handling Implementation

1. Add robust error handling to all authentication endpoints
2. Implement fallback mechanisms
3. Add user-friendly error messages
4. Set up logging for troubleshooting