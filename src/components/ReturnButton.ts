/**
 * Return to Open WebUI Button Component
 * This creates a button that allows users to return to Open WebUI
 */

/**
 * Create a Return button and append it to the document
 */
export function initReturnButton(): void {
  if (typeof document === 'undefined') return
  
  // Create the button
  const button = document.createElement('div')
  button.className = 'return-button'
  button.title = 'Return to Open WebUI'
  
  // Add button text and icon
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    <span>Return to Open WebUI</span>
  `
  
  // Add button event
  button.onclick = returnToOpenWebUI
  
  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    .return-button {
      position: fixed;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
      z-index: 1000;
    }
    
    .return-button:hover {
      background-color: #e2e8f0;
      color: #334155;
    }
  `
  
  // Add button and styles to document
  document.head.appendChild(style)
  document.body.appendChild(button)
}

/**
 * Return to Open WebUI
 * This creates a form submission to return to Open WebUI
 */
function returnToOpenWebUI(): void {
  // Get the stored return URL
  const openWebUIUrl = localStorage.getItem('open_webui_url') || 'http://localhost:8080'
  const returnPath = localStorage.getItem('editor_return_path') || '/'
  
  // Create a form for POST submission
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `${openWebUIUrl}/api/v1/return`
  
  // Add editor token
  const token = localStorage.getItem('editor_token')
  if (token) {
    const tokenInput = document.createElement('input')
    tokenInput.type = 'hidden'
    tokenInput.name = 'editor_token'
    tokenInput.value = token
    form.appendChild(tokenInput)
  }
  
  // Add return path
  const returnPathInput = document.createElement('input')
  returnPathInput.type = 'hidden'
  returnPathInput.name = 'return_path'
  returnPathInput.value = returnPath
  form.appendChild(returnPathInput)
  
  // Add document ID if we have one
  const documentId = getCurrentDocumentId()
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

/**
 * Get current document ID
 * In a real implementation, this would get the current document from the editor state
 */
function getCurrentDocumentId(): string | null {
  // This is a placeholder - in a real implementation, this would get the current document ID
  // from the editor's state management system
  return 'current-document-123'
}