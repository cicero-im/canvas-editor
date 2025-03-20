<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/user';
  import { locale } from '$lib/stores/locale';
  import { createSecureFormSubmission, getTokenFromStorage, isValidTokenFormat } from '../../../../integration/auth-helpers';
  import { getServiceUrls } from '../../../../integration/environment';
  
  let editorServiceUrl = '';
  let isButtonDisabled = false;
  let errorMessage = '';
  
  onMount(() => {
    const urls = getServiceUrls();
    editorServiceUrl = urls.editorUrl;
  });
  
  // Function to open the editor with error handling
  async function openEditor() {
    errorMessage = '';
    isButtonDisabled = true;
    
    try {
      // Get the token from storage
      const token = getTokenFromStorage();
      
      if (!token) {
        errorMessage = 'Please log in to access the document editor';
        console.error('No authentication token found');
        isButtonDisabled = false;
        return;
      }
      
      if (!isValidTokenFormat(token)) {
        errorMessage = 'Invalid authentication token format';
        console.error('Invalid token format');
        isButtonDisabled = false;
        return;
      }
      
      // Create and submit a form to the editor
      const form = createSecureFormSubmission(`${editorServiceUrl}/auth`, token, {
        locale: $locale || 'en',
        return_path: window.location.pathname,
        context: JSON.stringify({
          user_id: $user?.id,
          theme: document.documentElement.getAttribute('data-theme') || 'light',
          timestamp: new Date().toISOString()
        })
      });
      
      // Add the form to the page and submit it
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      // Reset button after submission
      setTimeout(() => {
        isButtonDisabled = false;
      }, 1000);
    } catch (e) {
      console.error('Editor navigation error:', e);
      errorMessage = 'Error accessing the document editor';
      isButtonDisabled = false;
    }
  }
</script>

<button 
  class="flex items-center gap-2 px-3 py-2 mt-1 text-sm font-medium transition-colors duration-150 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 group"
  on:click={openEditor}
  aria-label="Open Document Editor"
  title="Create and edit documents"
  disabled={isButtonDisabled}
>
  <!-- The editor icon -->
  <svg class="w-5 h-5 text-gray-500 transition-colors duration-150 group-hover:text-primary-500 dark:text-gray-400 dark:group-hover:text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <path d="M11 11l4 4"></path>
  </svg>
  
  <!-- The button text -->
  <span class="transition-colors duration-150 group-hover:text-primary-500 dark:group-hover:text-primary-400">
    Document Editor
  </span>
  
  <!-- Notification badge if there are unread documents -->
  {#if $user?.unreadDocuments > 0}
    <span class="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full">
      {$user.unreadDocuments > 99 ? '99+' : $user.unreadDocuments}
    </span>
  {/if}
</button>

<!-- Error message display -->
{#if errorMessage}
  <div class="mt-2 text-sm text-red-500" role="alert">
    {errorMessage}
  </div>
{/if}