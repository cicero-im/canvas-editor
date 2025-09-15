// Import the CORS headers
import { corsHeaders } from '../../../../integration/cors.js'

// Mock function to verify JWT - in a real app, you would use a proper JWT library
async function verifyJWT(token, secret) {
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

// Export the GET handler for the validation endpoint
export async function GET(request) {
  // Enable CORS for cross-origin requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  // Extract the Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return new Response(JSON.stringify({ 
      detail: 'No authentication credentials provided',
      error_code: 'missing_token'
    }), {
      status: 401,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  }
  
  try {
    // Verify JWT with proper error handling
    const userData = await verifyJWT(token, process.env.JWT_SECRET || 'your_secure_jwt_secret')
    
    return new Response(JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions,
      // Include timestamp for token freshness verification
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  } catch (error) {
    console.error('Token validation error:', error.message)
    
    // Detailed error responses for different failure modes
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
    
    return new Response(JSON.stringify({ 
      detail,
      error_code
    }), {
      status,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  }
}

// CORS handling for preflight requests
export function OPTIONS() {
  return new Response(null, {
    headers: corsHeaders
  })
}