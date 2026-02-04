import { useRef, useMemo, useState, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { TableRow, ColumnInfo } from '@table-sorter/shared'
import { ColumnHeader } from './column-header'
import { FilterInput } from './filter-input'
import { cn } from '@/lib/utils'

interface DataTableProps {
  data: TableRow[]
  columns: ColumnInfo[]
  totalRows: number
  className?: string
}

export function DataTable({ data, columns: columnInfo, totalRows, className }: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Build columns from column info
  const columns = useMemo<ColumnDef<TableRow>[]>(
    () =>
      columnInfo.map((col) => ({
        id: col.name,
        accessorKey: col.name,
        header: ({ column }) => <ColumnHeader column={column} title={col.name} />,
        cell: ({ getValue }) => {
          const value = getValue()
          if (value === null) {
            return <span className="text-muted-foreground italic">NULL</span>
          }
          if (typeof value === 'boolean') {
            return value ? 'true' : 'false'
          }
          return String(value)
        },
        filterFn: 'includesString',
      })),
    [columnInfo]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 20,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0) : 0

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Global filter */}
      <div className="p-2 border-b">
        <FilterInput
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search all columns..."
          className="max-w-sm"
        />
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 text-sm text-muted-foreground border-b bg-muted/30">
        Showing {rows.length.toLocaleString()} of {totalRows.toLocaleString()} rows
        {sorting.length > 0 && (
          <span className="ml-4">
            Sorted by: {sorting.map((s) => `${s.id} (${s.desc ? 'desc' : 'asc'})`).join(', ')}
          </span>
        )}
      </div>

      {/* Table container */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-background z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-4 text-left align-middle font-medium text-muted-foreground border-r last:border-r-0"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
            {/* Column filters row */}
            <tr className="border-b bg-muted/20">
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <th key={`filter-${header.id}`} className="px-2 py-1 border-r last:border-r-0">
                  <FilterInput
                    value={(header.column.getFilterValue() as string) ?? ''}
                    onChange={(value) => header.column.setFilterValue(value)}
                    placeholder={`Filter ${header.column.id}...`}
                    className="h-7 text-xs"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null
              return (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                  style={{ height: `${virtualRow.size}px` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 align-middle border-r last:border-r-0 truncate max-w-[300px]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
