import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { TableParamSchema, TableQuerySchema } from '@table-sorter/shared'
import { snowflakeService } from '../services/snowflake.js'

export const tableRoutes = new Hono()

// Get table metadata (columns, row count)
tableRoutes.get(
  '/tables/:db/:schema/:table/metadata',
  zValidator('param', TableParamSchema),
  async (c) => {
    const { db, schema, table } = c.req.valid('param')

    const metadata = await snowflakeService.getTableMetadata(db, schema, table)

    return c.json({
      success: true,
      data: {
        database: db,
        schema,
        table,
        ...metadata,
      },
    })
  }
)

// Get table data with pagination and sorting
tableRoutes.get(
  '/tables/:db/:schema/:table/data',
  zValidator('param', TableParamSchema),
  zValidator('query', TableQuerySchema),
  async (c) => {
    const { db, schema, table } = c.req.valid('param')
    const { limit, offset, sortBy, sortDir } = c.req.valid('query')

    const startTime = Date.now()
    const { rows, totalRows } = await snowflakeService.getTableData(db, schema, table, {
      limit,
      offset,
      sortBy,
      sortDir,
    })
    const executionTimeMs = Date.now() - startTime

    return c.json({
      success: true,
      data: {
        rows,
        totalRows,
        offset,
        limit,
        hasMore: offset + rows.length < totalRows,
        executionTimeMs,
      },
    })
  }
)
