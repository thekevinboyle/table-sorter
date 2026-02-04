import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTableStore } from '@/stores/table-store'
import { useDatabases, useSchemas, useTables, useTableMetadata, useTableData } from '@/hooks/use-table-data'
import { DataTable } from '@/components/table/data-table'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface TableSelectorProps {
  onSelect: (db: string, schema: string, table: string) => void
  label: string
}

function TableSelector({ onSelect, label }: TableSelectorProps) {
  const [selectedDb, setSelectedDb] = useState('')
  const [selectedSchema, setSelectedSchema] = useState('')

  const { data: databases } = useDatabases()
  const { data: schemas } = useSchemas(selectedDb)
  const { data: tables } = useTables(selectedDb, selectedSchema)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={selectedDb}
          onChange={(e) => {
            setSelectedDb(e.target.value)
            setSelectedSchema('')
          }}
        >
          <option value="">Select database...</option>
          {databases?.map((db) => (
            <option key={db.name} value={db.name}>
              {db.name}
            </option>
          ))}
        </select>

        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={selectedSchema}
          onChange={(e) => setSelectedSchema(e.target.value)}
          disabled={!selectedDb}
        >
          <option value="">Select schema...</option>
          {schemas?.map((schema) => (
            <option key={schema.name} value={schema.name}>
              {schema.name}
            </option>
          ))}
        </select>

        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onChange={(e) => {
            if (e.target.value) {
              onSelect(selectedDb, selectedSchema, e.target.value)
            }
          }}
          disabled={!selectedSchema}
        >
          <option value="">Select table...</option>
          {tables?.map((table) => (
            <option key={table.name} value={table.name}>
              {table.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

interface CompareTableProps {
  database: string
  schema: string
  table: string
}

function CompareTable({ database, schema, table }: CompareTableProps) {
  const { data: metadata } = useTableMetadata(database, schema, table)
  const { data: tableData } = useTableData(database, schema, table, { limit: 5000 })

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b bg-muted/30 text-sm font-medium">
        {database}.{schema}.{table}
        <span className="ml-2 text-muted-foreground">
          ({tableData.totalRows.toLocaleString()} rows)
        </span>
      </div>
      <DataTable
        data={tableData.rows}
        columns={metadata.columns}
        totalRows={tableData.totalRows}
        className="flex-1"
      />
    </div>
  )
}

export function CompareView() {
  const navigate = useNavigate()
  const [leftTable, setLeftTable] = useState<{
    db: string
    schema: string
    table: string
  } | null>(null)
  const [rightTable, setRightTable] = useState<{
    db: string
    schema: string
    table: string
  } | null>(null)

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/explore')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explorer
        </Button>
        <h1 className="text-lg font-semibold">Compare Tables</h1>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Select Tables to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <TableSelector
              label="Left Table"
              onSelect={(db, schema, table) => setLeftTable({ db, schema, table })}
            />
            <TableSelector
              label="Right Table"
              onSelect={(db, schema, table) => setRightTable({ db, schema, table })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="border rounded-lg overflow-hidden">
          {leftTable ? (
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <CompareTable
                database={leftTable.db}
                schema={leftTable.schema}
                table={leftTable.table}
              />
            </Suspense>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a table to compare
            </div>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          {rightTable ? (
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <CompareTable
                database={rightTable.db}
                schema={rightTable.schema}
                table={rightTable.table}
              />
            </Suspense>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a table to compare
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
