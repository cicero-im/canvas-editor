<script>
  import { onMount } from 'svelte';
  import { getServiceUrls } from '../../../../integration/environment';
  
  let returnPath = '/';
  let openWebUIUrl = '';
  let isButtonDisabled = false;
  
  // Function to return to Open WebUI
  function returnToOpenWebUI() {
    if (isButtonDisabled) return;
    isButtonDisabled = true;
    
    try {
      // Get the editor token and other data
      const editorToken = localStorage.getItem('editor_token');
      const returnPath = localStorage.getItem('editor_return_path') || '/';
      
      if (!editorToken) {
        // Fallback if no token is found
        window.location.href = openWebUIUrl;
        return;
      }
      
      // Create a form with CSRF protection
      const csrfToken = generateRandomString(32);
      localStorage.setItem('editor_csrf_token', csrfToken);
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${openWebUIUrl}/api/v1/return`;
      
      // Add the token
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'editor_token';
      tokenInput.value = editorToken;
      form.appendChild(tokenInput);
      
      // Add the CSRF token
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrf_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
      
      // Add the return path
      const returnPathInput = document.createElement('input');
      returnPathInput.type = 'hidden';
      returnPathInput.name = 'return_path';
      returnPathInput.value = returnPath;
      form.appendChild(returnPathInput);
      
      // Add the current document ID if there is one
      const documentId = getCurrentDocumentId();
      if (documentId) {
        const documentIdInput = document.createElement('input');
        documentIdInput.type = 'hidden';
        documentIdInput.name = 'document_id';
        documentIdInput.value = documentId;
        form.appendChild(documentIdInput);
      }
      
      // Submit the form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      // Reset button after a timeout
      setTimeout(() => {
        isButtonDisabled = false;
      }, 2000);
    } catch (error) {
      console.error('Return navigation error:', error);
      // Fallback to direct navigation on error
      window.location.href = openWebUIUrl;
    }
  }
  
  // Helper function to get the current document ID
  function getCurrentDocumentId() {
    // In a real app, you would get this from your state
    return 'current-document-123';
  }
  
  // Helper function to generate a random string for CSRF
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // Initialize variables when component mounts
  onMount(() => {
    returnPath = localStorage.getItem('editor_return_path') || '/';
    const urls = getServiceUrls();
    openWebUIUrl = urls.openWebUIUrl;
  });
</script>

<button 
  class="return-button" 
  on:click={returnToOpenWebUI}
  aria-label="Return to Open WebUI"
  title="Return to Open WebUI"
  disabled={isButtonDisabled}
>
  <svg class="return-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
  <span>Return to Open WebUI</span>
</button>

<style>
  .return-button {
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
  }
  
  .return-button:hover:not([disabled]) {
    background-color: #e2e8f0;
    color: #334155;
  }
  
  .return-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .return-icon {
    width: 1rem;
    height: 1rem;
  }
</style>