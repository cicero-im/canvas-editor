/**
 * Auth handlers for browser environment
 * This provides a simplified API without requiring Node.js
 */
import { validateToken } from './validate'

/**
 * Handle auth-related API requests in the browser context
 * To be exposed via the window object for remote calls
 */
export const AuthAPI = {
  /**
   * Validate a token from Open WebUI
   */
  async validateToken(token: string): Promise<any> {
    const result = await validateToken(token)
    return result
  },
  
  /**
   * Process an authentication token from URL parameters
   * This should be called when the application loads
   */
  processAuthFromUrl(): any {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    if (!token) return null
    
    try {
      // For simplicity, we're assuming the token is a JWT with encoded user data
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) return null
      
      // Basic JWT parsing
      const payload = JSON.parse(atob(tokenParts[1]))
      
      // Store auth data in localStorage
      this.storeAuthData(token, payload)
      
      // Store return path if provided
      const returnPath = urlParams.get('return_path')
      if (returnPath) {
        localStorage.setItem('editor_return_path', returnPath)
      }
      
      return payload
    } catch (error) {
      console.error('Error processing auth token:', error)
      return null
    }
  },
  
  /**
   * Store authentication data in localStorage
   */
  storeAuthData(token: string, userData: any): void {
    try {
      localStorage.setItem('editor_token', token)
      localStorage.setItem('editor_user', JSON.stringify(userData))
      localStorage.setItem('editor_auth_time', Date.now().toString())
    } catch (error) {
      console.error('Error storing auth data:', error)
    }
  },
  
  /**
   * Get the authenticated user data
   */
  getUserData(): any {
    try {
      const userData = localStorage.getItem('editor_user')
      if (!userData) return null
      return JSON.parse(userData)
    } catch (error) {
      console.error('Error retrieving user data:', error)
      return null
    }
  },
  
  /**
   * Check if a user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('editor_token')
  },
  
  /**
   * Return to Open WebUI
   */
  returnToOpenWebUI(documentId?: string): void {
    const openWebUIUrl = localStorage.getItem('open_webui_url') || 'http://localhost:8080'
    const token = localStorage.getItem('editor_token')
    const returnPath = localStorage.getItem('editor_return_path') || '/'
    
    if (!token) {
      window.location.href = openWebUIUrl
      return
    }
    
    // Create form for POST submission
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${openWebUIUrl}/api/v1/return`
    
    // Add token
    const tokenInput = document.createElement('input')
    tokenInput.type = 'hidden'
    tokenInput.name = 'editor_token'
    tokenInput.value = token
    form.appendChild(tokenInput)
    
    // Add return path
    const returnPathInput = document.createElement('input')
    returnPathInput.type = 'hidden'
    returnPathInput.name = 'return_path'
    returnPathInput.value = returnPath
    form.appendChild(returnPathInput)
    
    // Add document ID if provided
    if (documentId) {
      const documentIdInput = document.createElement('input')
      documentIdInput.type = 'hidden'
      documentIdInput.name = 'document_id'
      documentIdInput.value = documentId
      form.appendChild(documentIdInput)
    }
    
    // Submit form
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }
}

// Expose API to window for external access if in browser environment
if (typeof window !== 'undefined') {
  (window as any).EditorAuthAPI = AuthAPI
}

export default AuthAPI