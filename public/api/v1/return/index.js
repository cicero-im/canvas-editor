// Import the CORS headers
import { corsHeaders } from '../../../../integration/cors.js'

// Mock function to create JWT - in a real app, you would use a proper JWT library
function createJWT(userData) {
  // This is a placeholder - in a real app, you would create a proper JWT
  return `mock_jwt_for_${userData.id}_${Date.now()}`
}

// Export the POST handler for the return endpoint
export async function POST(request) {
  try {
    // Get form data with fallbacks and validation
    const data = await request.formData()
    const editorToken = data.get('editor_token')
    const documentId = data.get('document_id')
    const returnPath = data.get('return_path') || '/'
    
    if (!editorToken) {
      console.warn('Missing editor token in return request')
      return new Response(null, {
        status: 303,
        headers: { 
          ...corsHeaders,
          'Location': '/login?error=missing_credentials' 
        }
      })
    }
    
    // Get the Editor service URL from environment
    const editorServiceUrl = process.env.EDITOR_SERVICE_URL || 'http://localhost:3000'
    
    try {
      // Validate the editor token with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${editorServiceUrl}/api/validate-return`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({ 
          token: editorToken,
          document_id: documentId
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const userData = await response.json()
        
        // Create a new OpenWebUI JWT
        const openWebUIToken = createJWT({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          permissions: userData.permissions
        })
        
        // Secure return with XSS protection
        const redirectHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Returning to Open WebUI...</title>
              <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
            </head>
            <body>
              <p>Returning to Open WebUI...</p>
              <script>
                // Store token securely
                localStorage.setItem('token', ${JSON.stringify(openWebUIToken)});
                // Use safe URL handling
                window.location.href = ${JSON.stringify(returnPath)};
              </script>
            </body>
          </html>
        `
        
        return new Response(redirectHTML, {
          status: 200,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/html',
            'X-Frame-Options': 'DENY'
          }
        })
      } else {
        // Handle validation failures with proper logging
        const errorData = await response.json()
        console.error('Return validation failed:', errorData.detail)
        
        return new Response(null, {
          status: 303,
          headers: { 
            ...corsHeaders,
            'Location': `/login?error=${encodeURIComponent(errorData.detail || 'invalid_return_token')}` 
          }
        })
      }
    } catch (error) {
      // Handle network errors and timeouts
      console.error('Return endpoint error:', error)
      let errorMessage = 'return_processing_error'
      
      if (error.name === 'AbortError') {
        errorMessage = 'editor_service_timeout'
        console.error('Editor service validation timed out')
      }
      
      return new Response(null, {
        status: 303,
        headers: { 
          ...corsHeaders,
          'Location': `/login?error=${errorMessage}` 
        }
      })
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in return endpoint:', error)
    
    return new Response(null, {
      status: 303,
      headers: { 
        ...corsHeaders,
        'Location': '/login?error=server_error' 
      }
    })
  }
}

// CORS handling for preflight requests
export function OPTIONS() {
  return new Response(null, {
    headers: corsHeaders
  })
}