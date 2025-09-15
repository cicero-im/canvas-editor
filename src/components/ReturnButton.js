/**
 * Return Button Component
 * Provides a button to return to Open WebUI from Canvas Editor
 */

// Import the environment utilities
import { getServiceUrls } from '../../integration/environment.js'

// Initialize the Return Button
export function initReturnButton() {
  console.log('Initializing Return Button...')
  
  // Create the button container
  const container = document.createElement('div')
  container.className = 'return-button-container'
  container.style.position = 'fixed'
  container.style.top = '10px'
  container.style.right = '10px'
  container.style.zIndex = '1000'
  
  // Create the button
  const button = document.createElement('button')
  button.className = 'return-button'
  button.innerHTML = `
    <svg class="return-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 5px;">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    <span>Return to Open WebUI</span>
  `
  
  // Style the button
  button.style.display = 'flex'
  button.style.alignItems = 'center'
  button.style.gap = '5px'
  button.style.padding = '8px 12px'
  button.style.backgroundColor = '#f1f5f9'
  button.style.color = '#475569'
  button.style.border = 'none'
  button.style.borderRadius = '4px'
  button.style.fontSize = '14px'
  button.style.fontWeight = '500'
  button.style.cursor = 'pointer'
  button.style.transition = 'background-color 0.15s, color 0.15s'
  
  // Add hover effect
  button.addEventListener('mouseover', () => {
    if (!button.disabled) {
      button.style.backgroundColor = '#e2e8f0'
      button.style.color = '#334155'
    }
  })
  
  button.addEventListener('mouseout', () => {
    if (!button.disabled) {
      button.style.backgroundColor = '#f1f5f9'
      button.style.color = '#475569'
    }
  })
  
  // Add click handler
  button.addEventListener('click', returnToOpenWebUI)
  
  // Add the button to the container
  container.appendChild(button)
  
  // Add the container to the document
  document.body.appendChild(container)
  
  return button
}

// Function to return to Open WebUI
function returnToOpenWebUI() {
  const button = document.querySelector('.return-button')
  if (button.disabled) return
  button.disabled = true
  
  try {
    // Get the editor token and other data
    const editorToken = localStorage.getItem('editor_token')
    const returnPath = localStorage.getItem('editor_return_path') || '/'
    
    if (!editorToken) {
      // Fallback if no token is found
      const { openWebUIUrl } = getServiceUrls()
      window.location.href = openWebUIUrl
      return
    }
    
    // Create a form with CSRF protection
    const csrfToken = generateRandomString(32)
    localStorage.setItem('editor_csrf_token', csrfToken)
    
    const { openWebUIUrl } = getServiceUrls()
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${openWebUIUrl}/api/v1/return`
    
    // Add the token
    const tokenInput = document.createElement('input')
    tokenInput.type = 'hidden'
    tokenInput.name = 'editor_token'
    tokenInput.value = editorToken
    form.appendChild(tokenInput)
    
    // Add the CSRF token
    const csrfInput = document.createElement('input')
    csrfInput.type = 'hidden'
    csrfInput.name = 'csrf_token'
    csrfInput.value = csrfToken
    form.appendChild(csrfInput)
    
    // Add the return path
    const returnPathInput = document.createElement('input')
    returnPathInput.type = 'hidden'
    returnPathInput.name = 'return_path'
    returnPathInput.value = returnPath
    form.appendChild(returnPathInput)
    
    // Add the current document ID if there is one
    const documentId = getCurrentDocumentId()
    if (documentId) {
      const documentIdInput = document.createElement('input')
      documentIdInput.type = 'hidden'
      documentIdInput.name = 'document_id'
      documentIdInput.value = documentId
      form.appendChild(documentIdInput)
    }
    
    // Submit the form
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
    
    // Reset button after a timeout
    setTimeout(() => {
      button.disabled = false
    }, 2000)
  } catch (error) {
    console.error('Return navigation error:', error)
    // Fallback to direct navigation on error
    const { openWebUIUrl } = getServiceUrls()
    window.location.href = openWebUIUrl
  }
}

// Helper function to get the current document ID
function getCurrentDocumentId() {
  // In a real app, you would get this from your state
  return 'current-document-123'
}

// Helper function to generate a random string for CSRF
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}