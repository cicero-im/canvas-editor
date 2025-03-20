/**
 * Local integration runner for Canvas Editor & Open WebUI
 * Run with: node run-local-integration.js
 */

import { createServer } from 'http'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get the current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Mock JWT verification function
function verifyJWT(token, secret) {
  // This is a placeholder - in a real app, you would verify the JWT signature
  if (!token || token === 'invalid_token') {
    throw new Error('Invalid token')
  }
  
  if (token === 'expired_token') {
    throw new Error('jwt expired')
  }
  
  // Mock user data
  return {
    id: 'user123',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    permissions: {
      canEdit: true,
      canDelete: false
    }
  }
}

// Create a simple HTTP server for the OpenWebUI validation endpoint
const openWebUIServer = createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  
  // Handle validation endpoint
  if (req.url === '/api/v1/auth/validate' && req.method === 'GET') {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        detail: 'No authentication credentials provided',
        error_code: 'missing_token'
      }))
      return
    }
    
    try {
      // Verify JWT
      const userData = verifyJWT(token, 'your_secure_jwt_secret')
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions,
        timestamp: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Token validation error:', error.message)
      
      let status = 401
      let detail = 'Invalid authentication credentials'
      let error_code = 'invalid_token'
      
      if (error.message === 'jwt expired') {
        detail = 'Authentication token has expired'
        error_code = 'token_expired'
      } else if (error.message.includes('malformed')) {
        detail = 'Malformed authentication token'
        error_code = 'malformed_token'
      }
      
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ detail, error_code }))
    }
    return
  }
  
  // Handle return endpoint
  if (req.url === '/api/v1/return' && req.method === 'POST') {
    let body = ''
    
    req.on('data', chunk => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      try {
        const data = new URLSearchParams(body)
        const editorToken = data.get('editor_token')
        const returnPath = data.get('return_path') || '/'
        
        if (!editorToken) {
          res.writeHead(303, { 'Location': '/login?error=missing_credentials' })
          res.end()
          return
        }
        
        // Create a new OpenWebUI JWT
        const openWebUIToken = `mock_jwt_for_user123_${Date.now()}`
        
        // Secure return with XSS protection
        const redirectHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Returning to Open WebUI...</title>
              <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
            </head>
            <body>
              <p>Returning to Open WebUI...</p>
              <script>
                // Store token securely
                localStorage.setItem('token', ${JSON.stringify(openWebUIToken)});
                // Use safe URL handling
                window.location.href = ${JSON.stringify(returnPath)};
              </script>
            </body>
          </html>
        `
        
        res.writeHead(200, { 
          'Content-Type': 'text/html',
          'X-Frame-Options': 'DENY'
        })
        res.end(redirectHTML)
      } catch (error) {
        console.error('Return endpoint error:', error)
        res.writeHead(303, { 'Location': '/login?error=server_error' })
        res.end()
      }
    })
    return
  }
  
  // Serve the test page
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const html = readFileSync(join(__dirname, 'integration-test.html'), 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
      return
    } catch (error) {
      console.error('Error serving test page:', error)
    }
  }
  
  // Default 404 response
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

// Create a simple HTTP server for the Editor validation endpoint
const editorServer = createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  
  // Handle validation endpoint
  if (req.url === '/api/validate-return' && req.method === 'POST') {
    let body = ''
    
    req.on('data', chunk => {
      body += chunk.toString()
    })
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        const { token } = data
        
        if (!token) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            detail: 'No token provided',
            error_code: 'missing_token'
          }))
          return
        }
        
        // Parse the token
        const match = token.match(/EDITOR_TOKEN_FOR_([a-zA-Z0-9]+)_(\d+)_EXP_(\d+)/)
        
        if (!match) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            detail: 'Invalid token format',
            error_code: 'invalid_token'
          }))
          return
        }
        
        const userId = match[1]
        const expirationTime = parseInt(match[3], 10)
        const currentTime = Date.now()
        
        if (currentTime > expirationTime) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            detail: 'Token has expired',
            error_code: 'token_expired'
          }))
          return
        }
        
        // Return user data
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          id: userId,
          email: `user_${userId}@example.com`,
          name: `User ${userId}`,
          role: 'user',
          permissions: {}
        }))
      } catch (error) {
        console.error('Return validation error:', error)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          detail: 'Server error',
          error_code: 'server_error'
        }))
      }
    })
    return
  }
  
  // Serve the auth page
  if (req.url === '/auth') {
    try {
      const html = readFileSync(join(__dirname, 'integration-auth.html'), 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
      return
    } catch (error) {
      console.error('Error serving auth page:', error)
    }
  }
  
  // Serve the editor page
  if (req.url === '/editor') {
    try {
      const html = readFileSync(join(__dirname, 'integration-editor.html'), 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
      return
    } catch (error) {
      console.error('Error serving editor page:', error)
    }
  }
  
  // Default 404 response
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

// Start the servers
const OPENWEBUI_PORT = 8080
const EDITOR_PORT = 3000

openWebUIServer.listen(OPENWEBUI_PORT, () => {
  console.log(`OpenWebUI server running at http://localhost:${OPENWEBUI_PORT}/`)
})

editorServer.listen(EDITOR_PORT, () => {
  console.log(`Editor server running at http://localhost:${EDITOR_PORT}/`)
})

console.log('Press Ctrl+C to stop the servers')