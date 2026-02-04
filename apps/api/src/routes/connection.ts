import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ConnectionConfigSchema } from '@table-sorter/shared'
import { snowflakeService } from '../services/snowflake.js'

export const connectionRoutes = new Hono()

// Test and establish connection
connectionRoutes.post('/connect', zValidator('json', ConnectionConfigSchema), async (c) => {
  const config = c.req.valid('json')

  const status = await snowflakeService.connect(config)

  return c.json({
    success: true,
    data: status,
  })
})

// Disconnect
connectionRoutes.post('/disconnect', async (c) => {
  await snowflakeService.disconnect()

  return c.json({
    success: true,
    data: snowflakeService.getStatus(),
  })
})

// Get connection status
connectionRoutes.get('/connection/status', (c) => {
  return c.json({
    success: true,
    data: snowflakeService.getStatus(),
  })
})
