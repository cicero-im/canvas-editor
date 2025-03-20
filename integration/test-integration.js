/**
 * Test script for Canvas Editor & Open WebUI integration
 * 
 * This script tests the authentication flow between the two services.
 * Run with: node test-integration.js
 */

import { getServiceUrls } from './environment.js'
import { validateToken } from './auth-helpers.js'

// Mock token for testing
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6InVzZXIiLCJwZXJtaXNzaW9ucyI6eyJjYW5FZGl0Ijp0cnVlLCJjYW5EZWxldGUiOmZhbHNlfSwiaWF0IjoxNjc5MDAwMDAwLCJleHAiOjE2NzkwMDM2MDB9.8JGvTVmhgB9klZfCBj3R5Nk1_D3z5h5yLu6QQ7UgZXA'

// Mock editor token for testing
const EDITOR_TOKEN = 'EDITOR_TOKEN_FOR_user123_1679000000000_EXP_1679003600000'

async function testOpenWebUIValidation() {
  console.log('Testing OpenWebUI token validation...')
  
  try {
    const { openWebUIUrl } = getServiceUrls()
    
    // Test with fetch directly
    const response = await fetch(`${openWebUIUrl}/api/v1/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ OpenWebUI validation successful:', data)
    } else {
      const error = await response.json()
      console.error('❌ OpenWebUI validation failed:', error)
    }
  } catch (error) {
    console.error('❌ OpenWebUI validation error:', error.message)
  }
  
  // Test with helper function
  try {
    const userData = await validateToken(TEST_TOKEN)
    console.log('✅ Helper validation successful:', userData)
  } catch (error) {
    console.error('❌ Helper validation error:', error.message)
  }
}

async function testEditorValidation() {
  console.log('\nTesting Editor token validation...')
  
  try {
    const { editorUrl } = getServiceUrls()
    
    const response = await fetch(`${editorUrl}/api/validate-return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: EDITOR_TOKEN,
        document_id: 'test-doc-123'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Editor validation successful:', data)
    } else {
      const error = await response.json()
      console.error('❌ Editor validation failed:', error)
    }
  } catch (error) {
    console.error('❌ Editor validation error:', error.message)
  }
}

async function runTests() {
  console.log('🔍 Starting integration tests...')
  console.log('Using service URLs:', getServiceUrls())
  
  await testOpenWebUIValidation()
  await testEditorValidation()
  
  console.log('\n🏁 Tests completed')
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution error:', error)
  process.exit(1)
})