<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { validateToken } from '../../integration/auth-helpers';
  import { getServiceUrls } from '../../integration/environment';
  
  let isLoading = true;
  let error = null;
  let retryCount = 0;
  const maxRetries = 3;
  
  async function processAuthentication() {
    try {
      // Get form data with validation
      const formData = new FormData(document.querySelector('form'));
      const token = formData.get('token');
      const locale = formData.get('locale') || 'en';
      const returnPath = formData.get('return_path') || '/';
      let context = {};
      
      try {
        context = formData.get('context') ? JSON.parse(formData.get('context')) : {};
      } catch (e) {
        console.error('Failed to parse context:', e);
      }
      
      if (!token) {
        error = "No authentication token provided";
        isLoading = false;
        return;
      }
      
      // Get service URLs from environment
      const { openWebUIUrl } = getServiceUrls();
      
      try {
        // Validate the token with OpenWebUI with retries
        const userData = await validateToken(token, 2);
        
        // Create our own session
        localStorage.setItem('editor_token', createEditorToken(userData));
        localStorage.setItem('editor_user', JSON.stringify(userData));
        localStorage.setItem('editor_locale', locale);
        localStorage.setItem('editor_return_path', returnPath);
        
        // Store any extra context
        if (Object.keys(context).length > 0) {
          localStorage.setItem('editor_context', JSON.stringify(context));
        }
        
        // Redirect to the editor
        isLoading = false;
        goto('/editor');
      } catch (validationError) {
        console.error('Token validation failed:', validationError);
        
        if (retryCount < maxRetries && validationError.name !== 'TypeError') {
          // Retry for network issues but not for invalid tokens
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          return processAuthentication();
        }
        
        error = validationError.message || "Authentication failed";
        isLoading = false;
      }
    } catch (e) {
      console.error('Authentication processing error:', e);
      error = "An unexpected error occurred";
      isLoading = false;
    }
  }
  
  // Function to create an editor token with expiration
  function createEditorToken(userData) {
    // Create a token that expires in 1 hour
    const expiresAt = Date.now() + (60 * 60 * 1000);
    
    // In a real app, you would create a JWT here
    return `EDITOR_TOKEN_FOR_${userData.id}_${Date.now()}_EXP_${expiresAt}`;
  }
  
  onMount(() => {
    processAuthentication();
  });
</script>

<svelte:head>
  <title>Authenticating...</title>
</svelte:head>

<div class="auth-container">
  {#if isLoading}
    <div class="loading-box">
      <div class="spinner"></div>
      <p>Authenticating, please wait...</p>
      {#if retryCount > 0}
        <p class="retry-message">Retry attempt {retryCount}/{maxRetries}</p>
      {/if}
    </div>
  {:else if error}
    <div class="error-box">
      <h2>Authentication Error</h2>
      <p>{error}</p>
      <button 
        class="retry-button" 
        on:click={() => {
          const { openWebUIUrl } = getServiceUrls();
          window.location.href = openWebUIUrl;
        }}
      >
        Return to Open WebUI
      </button>
    </div>
  {/if}
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
  }
  
  .loading-box, .error-box {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    text-align: center;
    max-width: 400px;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem auto;
  }
  
  .retry-message {
    font-size: 0.8rem;
    color: #777;
    margin-top: 0.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  h2 {
    color: #e63946;
    margin-bottom: 1rem;
  }
  
  p {
    color: #555;
    margin-bottom: 1.5rem;
  }
  
  .retry-button {
    background-color: #457b9d;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .retry-button:hover {
    background-color: #1d3557;
  }
</style>