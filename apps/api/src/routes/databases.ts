import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { DatabaseParamSchema, SchemaParamSchema } from '@table-sorter/shared'
import { snowflakeService } from '../services/snowflake.js'

export const databaseRoutes = new Hono()

// List all databases
databaseRoutes.get('/databases', async (c) => {
  const databases = await snowflakeService.getDatabases()

  return c.json({
    success: true,
    data: databases,
  })
})

// List schemas in a database
databaseRoutes.get('/databases/:db/schemas', zValidator('param', DatabaseParamSchema), async (c) => {
  const { db } = c.req.valid('param')

  const schemas = await snowflakeService.getSchemas(db)

  return c.json({
    success: true,
    data: schemas,
  })
})

// List tables in a schema
databaseRoutes.get(
  '/databases/:db/schemas/:schema/tables',
  zValidator('param', SchemaParamSchema),
  async (c) => {
    const { db, schema } = c.req.valid('param')

    const tables = await snowflakeService.getTables(db, schema)

    return c.json({
      success: true,
      data: tables,
    })
  }
)
