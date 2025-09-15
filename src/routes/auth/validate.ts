/**
 * Token validation endpoint for Open WebUI integration
 */

// Simple response type
interface ValidationResponse {
  success: boolean;
  userData?: any;
  error?: string;
}

/**
 * Validate JWT token from the request
 * This endpoint will be called by Open WebUI to verify a token
 */
export async function validateToken(token: string): Promise<ValidationResponse> {
  if (!token) {
    return {
      success: false,
      error: 'No token provided'
    }
  }
  
  try {
    // In a real implementation, this would validate with a proper JWT library
    // and check against a secret key
    
    // For demo purposes, we'll assume any valid-looking token is ok
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      return {
        success: false,
        error: 'Invalid token format'
      }
    }
    
    // Parse the token payload (middle part of JWT)
    const payload = JSON.parse(atob(tokenParts[1]))
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return {
        success: false,
        error: 'Token expired'
      }
    }
    
    // Return the user data from the token
    return {
      success: true,
      userData: {
        id: payload.sub || payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'user',
        permissions: payload.permissions || {}
      }
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      success: false,
      error: 'Invalid token'
    }
  }
}