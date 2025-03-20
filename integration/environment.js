/**
 * Environment detection for proper service URLs
 */
export function getServiceUrls() {
  return {
    openWebUIUrl: process.env.OPENWEBUI_SERVICE_URL || 'http://localhost:8080',
    editorUrl: process.env.EDITOR_SERVICE_URL || 'http://localhost:3000'
  }
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}