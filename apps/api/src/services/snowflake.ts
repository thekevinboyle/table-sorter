import snowflake from 'snowflake-sdk'
import type {
  SnowflakeConnectionConfig,
  ConnectionStatus,
  ColumnInfo,
  TableRow,
} from '@table-sorter/shared'

// Snowflake SDK types
interface SnowflakeConnection {
  connect: (callback: (err: Error | undefined, conn: SnowflakeConnection) => void) => void
  execute: (options: {
    sqlText: string
    complete: (err: Error | undefined, stmt: unknown, rows: unknown[]) => void
  }) => void
  destroy: (callback: (err: Error | undefined) => void) => void
  isUp: () => boolean
  getId: () => string
}

interface SnowflakePool {
  use: (callback: (clientConnection: SnowflakeConnection) => Promise<unknown>) => Promise<unknown>
  drain: () => Promise<void>
}

class SnowflakeService {
  private pool: SnowflakePool | null = null
  private config: SnowflakeConnectionConfig | null = null
  private connectedAt: Date | null = null

  async connect(config: SnowflakeConnectionConfig): Promise<ConnectionStatus> {
    // Disconnect existing connection if any
    if (this.pool) {
      await this.disconnect()
    }

    this.config = config

    // Create connection pool
    this.pool = snowflake.createPool(
      {
        account: config.account,
        username: config.username,
        password: config.password,
        warehouse: config.warehouse,
        database: config.database,
        schema: config.schema,
        role: config.role,
      },
      {
        max: 10,
        min: 1,
        evictionRunIntervalMillis: 60000, // Check for idle connections every minute
        idleTimeoutMillis: 300000, // Close connections idle for 5 minutes
      }
    ) as SnowflakePool

    // Test the connection
    await this.executeQuery('SELECT CURRENT_VERSION()')

    this.connectedAt = new Date()

    return this.getStatus()
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.drain()
      this.pool = null
    }
    this.config = null
    this.connectedAt = null
  }

  getStatus(): ConnectionStatus {
    return {
      isConnected: this.pool !== null,
      account: this.config?.account ?? null,
      warehouse: this.config?.warehouse ?? null,
      database: this.config?.database ?? null,
      schema: this.config?.schema ?? null,
      connectedAt: this.connectedAt?.toISOString() ?? null,
    }
  }

  async executeQuery<T = TableRow>(sqlText: string): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Not connected to Snowflake')
    }

    return new Promise((resolve, reject) => {
      this.pool!.use(async (connection) => {
        return new Promise<T[]>((innerResolve, innerReject) => {
          connection.execute({
            sqlText,
            complete: (err, _stmt, rows) => {
              if (err) {
                innerReject(err)
              } else {
                innerResolve(rows as T[])
              }
            },
          })
        })
      })
        .then((result) => resolve(result as T[]))
        .catch(reject)
    })
  }

  async getDatabases(): Promise<{ name: string; createdOn: string; owner: string }[]> {
    const rows = await this.executeQuery<{
      name: string
      created_on: string
      owner: string
    }>('SHOW DATABASES')

    return rows.map((row) => ({
      name: row.name,
      createdOn: row.created_on,
      owner: row.owner,
    }))
  }

  async getSchemas(
    database: string
  ): Promise<{ name: string; databaseName: string; createdOn: string; owner: string }[]> {
    const rows = await this.executeQuery<{
      name: string
      database_name: string
      created_on: string
      owner: string
    }>(`SHOW SCHEMAS IN DATABASE "${database}"`)

    return rows.map((row) => ({
      name: row.name,
      databaseName: row.database_name,
      createdOn: row.created_on,
      owner: row.owner,
    }))
  }

  async getTables(
    database: string,
    schema: string
  ): Promise<
    {
      name: string
      databaseName: string
      schemaName: string
      kind: string
      rowCount: number
      bytes: number
      createdOn: string
      owner: string
    }[]
  > {
    const rows = await this.executeQuery<{
      name: string
      database_name: string
      schema_name: string
      kind: string
      rows: number
      bytes: number
      created_on: string
      owner: string
    }>(`SHOW TABLES IN "${database}"."${schema}"`)

    return rows.map((row) => ({
      name: row.name,
      databaseName: row.database_name,
      schemaName: row.schema_name,
      kind: row.kind,
      rowCount: row.rows ?? 0,
      bytes: row.bytes ?? 0,
      createdOn: row.created_on,
      owner: row.owner,
    }))
  }

  async getTableMetadata(
    database: string,
    schema: string,
    table: string
  ): Promise<{ columns: ColumnInfo[]; rowCount: number }> {
    // Get column info
    const columns = await this.executeQuery<{
      COLUMN_NAME: string
      DATA_TYPE: string
      IS_NULLABLE: string
      COLUMN_DEFAULT: string | null
      COMMENT: string | null
      ORDINAL_POSITION: number
    }>(`
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COMMENT,
        ORDINAL_POSITION
      FROM "${database}".INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${schema}' AND TABLE_NAME = '${table}'
      ORDER BY ORDINAL_POSITION
    `)

    // Get row count
    const countResult = await this.executeQuery<{ COUNT: number }>(
      `SELECT COUNT(*) as COUNT FROM "${database}"."${schema}"."${table}"`
    )
    const rowCount = countResult[0]?.COUNT ?? 0

    return {
      columns: columns.map((col) => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        defaultValue: col.COLUMN_DEFAULT,
        comment: col.COMMENT,
        primaryKey: false, // Would need additional query to determine
        ordinalPosition: col.ORDINAL_POSITION,
      })),
      rowCount,
    }
  }

  async getTableData(
    database: string,
    schema: string,
    table: string,
    options: {
      limit?: number
      offset?: number
      sortBy?: string
      sortDir?: 'asc' | 'desc'
    } = {}
  ): Promise<{ rows: TableRow[]; totalRows: number }> {
    const { limit = 1000, offset = 0, sortBy, sortDir = 'asc' } = options

    // Get total row count
    const countResult = await this.executeQuery<{ COUNT: number }>(
      `SELECT COUNT(*) as COUNT FROM "${database}"."${schema}"."${table}"`
    )
    const totalRows = countResult[0]?.COUNT ?? 0

    // Build query with optional sorting
    let query = `SELECT * FROM "${database}"."${schema}"."${table}"`
    if (sortBy) {
      query += ` ORDER BY "${sortBy}" ${sortDir.toUpperCase()}`
    }
    query += ` LIMIT ${limit} OFFSET ${offset}`

    const rows = await this.executeQuery<TableRow>(query)

    return { rows, totalRows }
  }
}

// Singleton instance
export const snowflakeService = new SnowflakeService()
