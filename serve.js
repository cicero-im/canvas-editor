import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

// Get the current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = process.cwd()

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

// Create a simple HTTP server
const server = createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  
  // Handle CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  
  // Parse the URL
  let url = req.url
  
  // If URL ends with a slash, serve index.html
  if (url.endsWith('/')) {
    url += 'index.html'
  }
  
  // Default to index.html for root
  if (url === '/') {
    url = '/index.html'
  }
  
  // Get the file path
  const filePath = join(__dirname, 'public', url)
  
  // Get the file extension
  const extName = extname(filePath)
  const contentType = mimeTypes[extName] || 'text/plain'
  
  // Check if the file exists
  if (existsSync(filePath)) {
    try {
      // Read the file
      const content = readFileSync(filePath)
      
      // Send the response
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
      res.writeHead(500)
      res.end(`Server Error: ${error.message}`)
    }
  } else {
    // If the file doesn't exist, check if it's an API endpoint
    if (url.startsWith('/api/')) {
      // Handle API endpoints
      handleApiRequest(req, res, url)
    } else {
      // File not found
      res.writeHead(404)
      res.end('404 Not Found')
    }
  }
})

// Function to handle API requests
async function handleApiRequest(req, res, url) {
  try {
    // Get the API module path
    const apiPath = join(__dirname, 'public', url)
    
    // Check if the API module exists
    if (existsSync(`${apiPath}.js`)) {
      // Import the API module
      const apiModule = await import(`${apiPath}.js`)
      
      // Call the appropriate method based on the request method
      if (req.method === 'GET' && apiModule.GET) {
        await apiModule.GET(req, res)
      } else if (req.method === 'POST' && apiModule.POST) {
        await apiModule.POST(req, res)
      } else if (req.method === 'OPTIONS' && apiModule.OPTIONS) {
        await apiModule.OPTIONS(req, res)
      } else {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Method Not Allowed' }))
      }
    } else {
      // API endpoint not found
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'API Endpoint Not Found' }))
    }
  } catch (error) {
    console.error(`Error handling API request ${url}:`, error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Server Error', message: error.message }))
  }
}

// Start the server
const PORT = 3001
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
  console.log(`API endpoints available at http://localhost:${PORT}/api/`)
})