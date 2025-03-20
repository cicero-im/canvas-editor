// Import the direct authentication handler and CORS headers
import { directAuthenticate } from '../../../integration/direct-auth.js'
import { corsHeaders } from '../../../integration/cors.js'

// Export the POST handler for direct authentication
export async function POST(request) {
  try {
    // Get request data
    const requestData = await request.json().catch(() => ({}))
    const { token, locale, returnPath, context } = requestData
    
    if (!token) {
      return new Response(JSON.stringify({ 
        detail: 'No authentication token provided',
        error_code: 'missing_token'
      }), {
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      })
    }
    
    try {
      // Directly authenticate and get session data
      const sessionData = await directAuthenticate(token, {
        locale: locale || 'en',
        returnPath: returnPath || '/',
        context: context || {}
      })
      
      // Return success response with redirect URL
      return new Response(JSON.stringify({
        success: true,
        redirect: '/editor',
        token: sessionData.editorToken,
        user: sessionData.userData
      }), {
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      })
    } catch (error) {
      console.error('Authentication error:', error)
      
      return new Response(JSON.stringify({ 
        detail: error.message || 'Authentication failed',
        error_code: 'auth_failed'
      }), {
        status: 401,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      })
    }
  } catch (error) {
    console.error('Unexpected error in direct auth endpoint:', error)
    
    return new Response(JSON.stringify({ 
      detail: 'Server error',
      error_code: 'server_error'
    }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
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