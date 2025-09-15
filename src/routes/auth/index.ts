/**
 * Authentication module for Open WebUI integration
 * Export all necessary functionality for auth integration
 */

// Export the auth API
export { default as AuthAPI } from './server'
export { validateToken } from './validate'

// Export types
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, any>;
}

// Initialize auth when loaded
export function initAuth(): void {
  // Process URL parameters for auth tokens
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    if (token) {
      console.log('Processing authentication token from URL')
      // Use the imported AuthAPI directly
      import('./server').then(({ default: AuthAPI }) => {
        const userData = AuthAPI.processAuthFromUrl()
        
        if (userData) {
          console.log('Authentication successful')
        } else {
          console.error('Failed to process authentication token')
        }
        
        // Clean up URL parameters after processing
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('return_path')
        window.history.replaceState({}, document.title, url.toString())
      })
    }
  }
}