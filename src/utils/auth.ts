/**
 * Simple authentication utilities for Canvas Editor integration with Open WebUI
 */

// Process an auth token from URL
export function processAuthToken(): void {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const returnPath = urlParams.get('return_path')
  const openWebUIUrl = urlParams.get('origin')
  
  // Store values if provided
  if (token) {
    localStorage.setItem('editor_token', token)
    console.log('Auth token received and stored')
    
    // Clean up URL after storing token
    const url = new URL(window.location.href)
    url.searchParams.delete('token')
    url.searchParams.delete('return_path')
    url.searchParams.delete('origin')
    window.history.replaceState({}, document.title, url.toString())
  }
  
  if (returnPath) {
    localStorage.setItem('editor_return_path', returnPath)
  }
  
  if (openWebUIUrl) {
    localStorage.setItem('open_webui_url', openWebUIUrl)
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('editor_token')
}

// Get stored auth token
export function getAuthToken(): string | null {
  return localStorage.getItem('editor_token')
}

// Create an editor token (for demo purposes)
export function createEditorToken(userId: string): string {
  // In a real implementation, this would create a proper JWT
  // For demo purposes, we create a simple token with expiration (1 hour)
  const expiresAt = Date.now() + (60 * 60 * 1000)
  return `EDITOR_TOKEN_FOR_${userId}_${Date.now()}_EXP_${expiresAt}`
}

// Get the Open WebUI URL
export function getOpenWebUIUrl(): string {
  return localStorage.getItem('open_webui_url') || 'http://localhost:8080'
}

// Initialize authentication (call on app startup)
export function initAuth(): void {
  // Process any authentication parameters in the URL
  processAuthToken()
}