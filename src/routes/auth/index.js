/**
 * Authentication module for Canvas Editor
 * Handles authentication between Open WebUI and Canvas Editor
 */

// Import the direct authentication handler
import { directAuthenticate } from '../../../integration/direct-auth.js'

// API for authentication operations
export const AuthAPI = {
  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('editor_token') !== null
  },
  
  // Get user data
  getUserData() {
    try {
      const userData = localStorage.getItem('editor_user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  },
  
  // Logout
  logout() {
    localStorage.removeItem('editor_token')
    localStorage.removeItem('editor_user')
    localStorage.removeItem('editor_locale')
    localStorage.removeItem('editor_return_path')
    localStorage.removeItem('editor_context')
  }
}

// Initialize authentication
export function initAuth() {
  console.log('Initializing authentication...')
  
  // Check URL for token parameter (for direct auth)
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  
  if (token) {
    // If token is provided in URL, authenticate directly
    directAuthenticate(token, {
      locale: urlParams.get('locale') || 'en',
      returnPath: urlParams.get('return_path') || '/',
      context: urlParams.get('context') ? JSON.parse(urlParams.get('context')) : {}
    })
      .then(() => {
        // Remove token from URL to prevent token leakage in browser history
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, document.title, url.toString())
        
        console.log('Authentication successful')
      })
      .catch(error => {
        console.error('Authentication failed:', error)
      })
  } else {
    // Check if already authenticated
    if (AuthAPI.isAuthenticated()) {
      console.log('User already authenticated')
    } else {
      console.log('User not authenticated')
    }
  }
}