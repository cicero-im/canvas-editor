/**
 * Editor Button Component with Direct Authentication
 * This component provides a button that directly transfers the user to the Canvas Editor
 * without requiring an HTML authentication page
 */

/**
 * Create and render an Editor Button that uses direct authentication
 * @param {Object} options - Configuration options
 * @param {string} options.container - CSS selector for the container element
 * @param {string} options.editorUrl - URL of the Canvas Editor
 * @param {string} options.token - JWT token for authentication
 * @param {string} options.locale - User locale
 * @param {string} options.returnPath - Path to return to after editing
 * @param {Object} options.context - Additional context to pass to the editor
 * @returns {HTMLElement} The created button element
 */
export function createEditorButton(options) {
  const {
    container,
    editorUrl = 'http://localhost:3000',
    token,
    locale = 'en',
    returnPath = window.location.pathname,
    context = {}
  } = options
  
  // Create the button element
  const button = document.createElement('button')
  button.className = 'editor-button'
  button.setAttribute('aria-label', 'Open Document Editor')
  button.setAttribute('title', 'Create and edit documents')
  
  // Add the button content
  button.innerHTML = `
    <svg class="editor-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
      <path d="M2 2l7.586 7.586"></path>
      <path d="M11 11l4 4"></path>
    </svg>
    <span>Document Editor</span>
  `
  
  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    .editor-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    .editor-button:hover {
      background-color: #e2e8f0;
    }
    .editor-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .editor-icon {
      width: 20px;
      height: 20px;
    }
    .editor-error {
      color: #e11d48;
      font-size: 14px;
      margin-top: 8px;
    }
  `
  document.head.appendChild(style)
  
  // Create error message element
  const errorElement = document.createElement('div')
  errorElement.className = 'editor-error'
  errorElement.style.display = 'none'
  
  // Add click handler
  button.addEventListener('click', async () => {
    // Disable button during authentication
    button.disabled = true
    errorElement.style.display = 'none'
    
    try {
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Call the direct authentication API
      const response = await fetch(`${editorUrl}/api/direct-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          locale,
          returnPath,
          context: {
            ...context,
            timestamp: new Date().toISOString()
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Authentication failed')
      }
      
      // Get the response data
      const data = await response.json()
      
      // Redirect to the editor
      window.location.href = `${editorUrl}${data.redirect}`
    } catch (error) {
      console.error('Editor authentication error:', error)
      
      // Show error message
      errorElement.textContent = error.message || 'Error accessing the document editor'
      errorElement.style.display = 'block'
      
      // Re-enable button
      button.disabled = false
    }
  })
  
  // Add the button and error element to the container
  const containerElement = document.querySelector(container)
  if (containerElement) {
    containerElement.appendChild(button)
    containerElement.appendChild(errorElement)
  } else {
    console.error(`Container element "${container}" not found`)
  }
  
  return button
}