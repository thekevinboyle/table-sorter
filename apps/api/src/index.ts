import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import { errorHandler } from './middleware/error.js'
import { connectionRoutes } from './routes/connection.js'
import { databaseRoutes } from './routes/databases.js'
import { tableRoutes } from './routes/tables.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Global error handler
app.onError(errorHandler)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.route('/api', connectionRoutes)
app.route('/api', databaseRoutes)
app.route('/api', tableRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

const port = Number(process.env['API_PORT']) || 3001

console.log(`Starting server on port ${port}...`)

serve({
  fetch: app.fetch,
  port,
})

console.log(`Server running at http://localhost:${port}`)
