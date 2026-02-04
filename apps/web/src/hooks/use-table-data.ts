import { useQuery, useSuspenseQuery, queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Query options for table metadata
export const tableMetadataOptions = (database: string, schema: string, table: string) =>
  queryOptions({
    queryKey: ['tableMetadata', database, schema, table],
    queryFn: () => api.getTableMetadata(database, schema, table),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

// Query options for table data
export const tableDataOptions = (
  database: string,
  schema: string,
  table: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
  }
) =>
  queryOptions({
    queryKey: ['tableData', database, schema, table, options],
    queryFn: () => api.getTableData(database, schema, table, options),
    staleTime: 60 * 1000, // 1 minute
  })

// Query options for databases
export const databasesOptions = () =>
  queryOptions({
    queryKey: ['databases'],
    queryFn: () => api.getDatabases(),
    staleTime: 5 * 60 * 1000,
  })

// Query options for schemas
export const schemasOptions = (database: string) =>
  queryOptions({
    queryKey: ['schemas', database],
    queryFn: () => api.getSchemas(database),
    staleTime: 5 * 60 * 1000,
    enabled: !!database,
  })

// Query options for tables
export const tablesOptions = (database: string, schema: string) =>
  queryOptions({
    queryKey: ['tables', database, schema],
    queryFn: () => api.getTables(database, schema),
    staleTime: 5 * 60 * 1000,
    enabled: !!database && !!schema,
  })

// Hooks
export function useTableMetadata(database: string, schema: string, table: string) {
  return useSuspenseQuery(tableMetadataOptions(database, schema, table))
}

export function useTableData(
  database: string,
  schema: string,
  table: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
  }
) {
  return useSuspenseQuery(tableDataOptions(database, schema, table, options))
}

export function useDatabases() {
  return useQuery(databasesOptions())
}

export function useSchemas(database: string) {
  return useQuery(schemasOptions(database))
}

export function useTables(database: string, schema: string) {
  return useQuery(tablesOptions(database, schema))
}
