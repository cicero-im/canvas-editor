/**
 * Shared authentication helpers with improved error handling
 */
import { getServiceUrls } from './environment.js'

// Function to extract a token from localStorage with fallback
export function getTokenFromStorage(key = 'token') {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch (error) {
    console.error('LocalStorage access error:', error)
  }
  return null
}

// Function to validate a token format with better error messaging
export function isValidTokenFormat(token) {
  if (!token) {
    console.warn('Token is empty or undefined')
    return false
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) {
    console.warn('Invalid token format: expected 3 parts separated by dots')
    return false
  }
  
  return true
}

// Function for token validation with timeout and retries
export async function validateToken(token, retries = 2) {
  const { openWebUIUrl } = getServiceUrls()
  let attempt = 0
  
  while (attempt <= retries) {
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
      console.error(`Token validation error (attempt ${attempt + 1}/${retries + 1}):`, error)
      
      if (error.name === 'AbortError') {
        console.warn('Request timed out, will retry')
      } else if (attempt >= retries) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      attempt++
    }
  }
}

// Function to create a secure form submission
export function createSecureFormSubmission(actionUrl, token, additionalData = {}) {
  // Create a form element
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = actionUrl
  form.style.display = 'none'
  
  // Add the token
  const tokenInput = document.createElement('input')
  tokenInput.type = 'hidden'
  tokenInput.name = 'token'
  tokenInput.value = token
  form.appendChild(tokenInput)
  
  // Add any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })
  
  return form
}