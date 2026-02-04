import { useParams } from 'react-router-dom'
import { Clock, Rows3, HardDrive } from 'lucide-react'
import { useTableMetadata, useTableData } from '@/hooks/use-table-data'
import { DataTable } from '@/components/table/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function TableMetadataCard({
  database,
  schema,
  table,
}: {
  database: string
  schema: string
  table: string
}) {
  const { data: metadata } = useTableMetadata(database, schema, table)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {database}.{schema}.{table}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Rows3 className="h-4 w-4" />
            <span>{metadata.rowCount.toLocaleString()} rows</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>{formatBytes(metadata.sizeBytes)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{metadata.columns.length} columns</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TableDataView({
  database,
  schema,
  table,
}: {
  database: string
  schema: string
  table: string
}) {
  const { data: metadata } = useTableMetadata(database, schema, table)
  const { data: tableData } = useTableData(database, schema, table, {
    limit: 10000, // Load up to 10k rows for client-side operations
  })

  return (
    <DataTable
      data={tableData.rows}
      columns={metadata.columns}
      totalRows={tableData.totalRows}
      className="h-[calc(100vh-220px)]"
    />
  )
}

export function TableViewer() {
  const { db, schema, table } = useParams<{
    db: string
    schema: string
    table: string
  }>()

  if (!db || !schema || !table) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Invalid table path
      </div>
    )
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <TableMetadataCard database={db} schema={schema} table={table} />
      <div className="flex-1 border rounded-lg overflow-hidden">
        <TableDataView database={db} schema={schema} table={table} />
      </div>
    </div>
  )
}
