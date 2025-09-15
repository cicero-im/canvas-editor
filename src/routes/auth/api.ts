/**
 * API handlers for auth endpoints
 */
import { validateToken } from './validate'

// Handle API requests with CORS support
export async function handleRequest(req: Request): Promise<Response> {
  // Set CORS headers to allow cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }

  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // Token validation endpoint
  if (req.url.endsWith('/auth/validate') && req.method === 'GET') {
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    // Validate the token
    const result = await validateToken(token || '')
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          detail: result.error,
          error_code: 'auth_error'
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // Return user data on success
    return new Response(
      JSON.stringify(result.userData),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
  
  // Endpoint for validating return tokens
  if (req.url.endsWith('/auth/validate-return') && req.method === 'POST') {
    try {
      const data = await req.json()
      const { token } = data
      
      if (!token) {
        return new Response(
          JSON.stringify({ 
            detail: 'No token provided',
            error_code: 'missing_token'
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        )
      }
      
      // This would validate the editor's token
      // For simplicity, we just extract user info from it
      const editorToken = token
      
      // Basic token format validation for our demo format:
      // EDITOR_TOKEN_FOR_[userId]_[timestamp]_EXP_[expirationTime]
      const match = editorToken.match(/EDITOR_TOKEN_FOR_([a-zA-Z0-9]+)_(\d+)_EXP_(\d+)/)
      if (!match) {
        return new Response(
          JSON.stringify({ 
            detail: 'Invalid token format',
            error_code: 'invalid_token'
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        )
      }
      
      const userId = match[1]
      const expirationTime = parseInt(match[3], 10)
      const currentTime = Date.now()
      
      // Check if token is expired
      if (currentTime > expirationTime) {
        return new Response(
          JSON.stringify({ 
            detail: 'Token expired',
            error_code: 'token_expired'
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        )
      }
      
      // In a real app, you would fetch user data from a database
      // Here we just return mock data
      return new Response(
        JSON.stringify({
          id: userId,
          email: `user_${userId}@example.com`,
          name: `User ${userId}`,
          role: 'user',
          permissions: {}
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      console.error('Error processing validate-return request:', error)
      return new Response(
        JSON.stringify({ 
          detail: 'Server error',
          error_code: 'server_error'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }
  
  // Handle unknown endpoints
  return new Response(
    JSON.stringify({ detail: 'Not Found' }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}