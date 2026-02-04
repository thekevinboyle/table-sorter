import type {
  ApiResponse,
  ConnectionStatus,
  SnowflakeConnectionConfig,
  DatabaseInfo,
  SchemaInfo,
  TableInfo,
  TableMetadata,
  TableRow,
} from '@table-sorter/shared'

const API_BASE = '/api'

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const data = (await response.json()) as ApiResponse<T>

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? 'An error occurred')
  }

  return data.data as T
}

// Connection endpoints
export const api = {
  // Connection
  connect: (config: SnowflakeConnectionConfig) =>
    fetchApi<ConnectionStatus>('/connect', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  disconnect: () =>
    fetchApi<ConnectionStatus>('/disconnect', { method: 'POST' }),

  getConnectionStatus: () =>
    fetchApi<ConnectionStatus>('/connection/status'),

  // Databases
  getDatabases: () =>
    fetchApi<DatabaseInfo[]>('/databases'),

  getSchemas: (database: string) =>
    fetchApi<SchemaInfo[]>(`/databases/${encodeURIComponent(database)}/schemas`),

  getTables: (database: string, schema: string) =>
    fetchApi<TableInfo[]>(
      `/databases/${encodeURIComponent(database)}/schemas/${encodeURIComponent(schema)}/tables`
    ),

  // Table data
  getTableMetadata: (database: string, schema: string, table: string) =>
    fetchApi<TableMetadata>(
      `/tables/${encodeURIComponent(database)}/${encodeURIComponent(schema)}/${encodeURIComponent(table)}/metadata`
    ),

  getTableData: (
    database: string,
    schema: string,
    table: string,
    options?: {
      limit?: number
      offset?: number
      sortBy?: string
      sortDir?: 'asc' | 'desc'
    }
  ) => {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', String(options.limit))
    if (options?.offset) params.set('offset', String(options.offset))
    if (options?.sortBy) params.set('sortBy', options.sortBy)
    if (options?.sortDir) params.set('sortDir', options.sortDir)

    const query = params.toString()
    return fetchApi<{
      rows: TableRow[]
      totalRows: number
      offset: number
      limit: number
      hasMore: boolean
      executionTimeMs: number
    }>(
      `/tables/${encodeURIComponent(database)}/${encodeURIComponent(schema)}/${encodeURIComponent(table)}/data${query ? `?${query}` : ''}`
    )
  },
}
