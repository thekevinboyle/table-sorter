import { z } from 'zod'

// Connection Schemas
export const ConnectionConfigSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  warehouse: z.string().optional(),
  database: z.string().optional(),
  schema: z.string().optional(),
  role: z.string().optional(),
})

export type ConnectionConfigInput = z.infer<typeof ConnectionConfigSchema>

// Query Parameters Schemas
export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(10000).default(1000),
  offset: z.coerce.number().int().min(0).default(0),
})

export type PaginationInput = z.infer<typeof PaginationSchema>

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional().default('asc'),
})

export type SortInput = z.infer<typeof SortSchema>

export const TableQuerySchema = PaginationSchema.merge(SortSchema)

export type TableQueryInput = z.infer<typeof TableQuerySchema>

// Path Parameter Schemas
export const DatabaseParamSchema = z.object({
  db: z.string().min(1),
})

export const SchemaParamSchema = z.object({
  db: z.string().min(1),
  schema: z.string().min(1),
})

export const TableParamSchema = z.object({
  db: z.string().min(1),
  schema: z.string().min(1),
  table: z.string().min(1),
})
