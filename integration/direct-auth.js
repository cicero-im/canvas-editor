/**
 * Direct authentication handler for Canvas Editor
 * This allows direct transfer from OpenWebUI to the editor without an HTML authentication page
 */

import { getServiceUrls } from './environment.js'

/**
 * Directly authenticate and redirect to the editor
 * @param {string} token - JWT token from OpenWebUI
 * @param {object} options - Additional options
 * @returns {Promise<void>}
 */
export async function directAuthenticate(token, options = {}) {
  const { locale = 'en', returnPath = '/', context = {} } = options
  
  if (!token) {
    throw new Error('No authentication token provided')
  }
  
  try {
    // Get service URLs
    const { openWebUIUrl } = getServiceUrls()
    
    // Validate the token with OpenWebUI
    const userData = await validateToken(token)
    
    // Create editor session
    const editorToken = createEditorToken(userData)
    
    // Store session data
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('editor_token', editorToken)
      localStorage.setItem('editor_user', JSON.stringify(userData))
      localStorage.setItem('editor_locale', locale)
      localStorage.setItem('editor_return_path', returnPath)
      
      // Store any extra context
      if (Object.keys(context).length > 0) {
        localStorage.setItem('editor_context', JSON.stringify(context))
      }
    }
    
    // Return the session data for API usage
    return {
      userData,
      editorToken,
      success: true
    }
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

/**
 * Validate token with OpenWebUI
 * @param {string} token - JWT token
 * @returns {Promise<object>} User data
 */
async function validateToken(token) {
  const { openWebUIUrl } = getServiceUrls()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${openWebUIUrl}/api/v1/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Token validation failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Token validation error:', error)
    throw error
  }
}

/**
 * Create an editor token with expiration
 * @param {object} userData - User data
 * @returns {string} Editor token
 */
function createEditorToken(userData) {
  // Create a token that expires in 1 hour
  const expiresAt = Date.now() + (60 * 60 * 1000)
  
  // In a real app, you would create a JWT here
  return `EDITOR_TOKEN_FOR_${userData.id}_${Date.now()}_EXP_${expiresAt}`
}