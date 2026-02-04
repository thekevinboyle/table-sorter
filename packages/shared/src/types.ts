// Snowflake Connection Types
export interface SnowflakeConnectionConfig {
  account: string
  username: string
  password: string
  warehouse?: string
  database?: string
  schema?: string
  role?: string
}

export interface ConnectionStatus {
  isConnected: boolean
  account: string | null
  warehouse: string | null
  database: string | null
  schema: string | null
  connectedAt: string | null
}

// Database Metadata Types
export interface DatabaseInfo {
  name: string
  createdOn: string
  owner: string
}

export interface SchemaInfo {
  name: string
  databaseName: string
  createdOn: string
  owner: string
}

export interface TableInfo {
  name: string
  databaseName: string
  schemaName: string
  kind: 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW'
  rowCount: number
  bytes: number
  createdOn: string
  owner: string
}

// Column & Data Types
export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  comment: string | null
  primaryKey: boolean
  ordinalPosition: number
}

export interface TableMetadata {
  database: string
  schema: string
  table: string
  columns: ColumnInfo[]
  rowCount: number
  sizeBytes: number
}

export type CellValue = string | number | boolean | null

export interface TableRow {
  [columnName: string]: CellValue
}

export interface QueryResult {
  columns: ColumnInfo[]
  rows: TableRow[]
  totalRows: number
  offset: number
  limit: number
  executionTimeMs: number
}

// Sorting & Filtering
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  columnId: string
  direction: SortDirection
}

export interface FilterConfig {
  columnId: string
  value: string
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}
