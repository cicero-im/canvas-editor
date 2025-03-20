export async function POST({ request }) {
  try {
    // Get the token from the request with validation
    const requestData = await request.json().catch(() => ({}))
    const { token, document_id } = requestData
    
    if (!token) {
      return new Response(JSON.stringify({ 
        detail: 'No token provided',
        error_code: 'missing_token'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Validate the token with expiration check
    const tokenInfo = parseEditorToken(token)
    
    if (!tokenInfo.isValid) {
      return new Response(JSON.stringify({ 
        detail: tokenInfo.error || 'Invalid token',
        error_code: 'invalid_token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Check token expiration
    if (tokenInfo.isExpired) {
      return new Response(JSON.stringify({ 
        detail: 'Token has expired',
        error_code: 'token_expired'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get the user data
    const userData = await getUserData(tokenInfo.userId)
    
    if (!userData) {
      return new Response(JSON.stringify({ 
        detail: 'User not found',
        error_code: 'user_not_found'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Return the user data
    return new Response(JSON.stringify({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Return validation error:', error)
    
    return new Response(JSON.stringify({ 
      detail: 'Server error',
      error_code: 'server_error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Helper function to extract user ID and validate token
function parseEditorToken(token) {
  // Default response
  const response = {
    isValid: false,
    isExpired: false,
    userId: null,
    error: 'Invalid token format'
  }
  
  try {
    // Parse our placeholder token format
    // EDITOR_TOKEN_FOR_[userId]_[timestamp]_EXP_[expirationTime]
    const match = token.match(/EDITOR_TOKEN_FOR_([a-zA-Z0-9]+)_(\d+)_EXP_(\d+)/)
    
    if (!match) {
      return response
    }
    
    const userId = match[1]
    const timestamp = parseInt(match[2], 10)
    const expirationTime = parseInt(match[3], 10)
    const currentTime = Date.now()
    
    return {
      isValid: true,
      isExpired: currentTime > expirationTime,
      userId,
      timestamp,
      expirationTime,
      error: null
    }
  } catch (error) {
    console.error('Token parsing error:', error)
    response.error = 'Token parsing error'
    return response
  }
}

// Helper function to get user data
async function getUserData(userId) {
  // In a real app, you would get this from your database
  // For now, we'll just return a placeholder
  return {
    id: userId,
    email: `user_${userId}@example.com`,
    name: `User ${userId}`,
    role: 'user',
    permissions: {}
  }
}