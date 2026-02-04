import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SortConfig, FilterConfig } from '@table-sorter/shared'

interface TableLocation {
  database: string
  schema: string
  table: string
}

interface TableState {
  // Active table
  activeTable: TableLocation | null

  // Sorting (multi-column support)
  sorting: SortConfig[]

  // Filtering
  filters: FilterConfig[]
  globalFilter: string

  // Column visibility
  visibleColumns: string[]

  // Compare mode
  compareTable: TableLocation | null
  isCompareMode: boolean

  // Actions
  setActiveTable: (table: TableLocation | null) => void
  setSorting: (sorting: SortConfig[]) => void
  toggleSort: (columnId: string, multiSort?: boolean) => void
  setFilters: (filters: FilterConfig[]) => void
  setColumnFilter: (columnId: string, value: string) => void
  setGlobalFilter: (value: string) => void
  setVisibleColumns: (columns: string[]) => void
  setCompareTable: (table: TableLocation | null) => void
  toggleCompareMode: () => void
  resetTableState: () => void
}

export const useTableStore = create<TableState>()(
  devtools(
    (set, get) => ({
      // Initial state
      activeTable: null,
      sorting: [],
      filters: [],
      globalFilter: '',
      visibleColumns: [],
      compareTable: null,
      isCompareMode: false,

      // Actions
      setActiveTable: (table) => set({ activeTable: table }),

      setSorting: (sorting) => set({ sorting }),

      toggleSort: (columnId, multiSort = false) => {
        const { sorting } = get()
        const existingSort = sorting.find((s) => s.columnId === columnId)

        if (existingSort) {
          // Cycle through: asc -> desc -> none
          if (existingSort.direction === 'asc') {
            set({
              sorting: sorting.map((s) =>
                s.columnId === columnId ? { ...s, direction: 'desc' as const } : s
              ),
            })
          } else {
            // Remove sort
            set({
              sorting: sorting.filter((s) => s.columnId !== columnId),
            })
          }
        } else {
          // Add new sort
          const newSort: SortConfig = { columnId, direction: 'asc' }
          set({
            sorting: multiSort ? [...sorting, newSort] : [newSort],
          })
        }
      },

      setFilters: (filters) => set({ filters }),

      setColumnFilter: (columnId, value) => {
        const { filters } = get()
        const existingIndex = filters.findIndex((f) => f.columnId === columnId)

        if (value === '') {
          // Remove filter
          set({
            filters: filters.filter((f) => f.columnId !== columnId),
          })
        } else if (existingIndex >= 0) {
          // Update existing filter
          set({
            filters: filters.map((f, i) =>
              i === existingIndex ? { ...f, value } : f
            ),
          })
        } else {
          // Add new filter
          set({
            filters: [...filters, { columnId, value, operator: 'contains' as const }],
          })
        }
      },

      setGlobalFilter: (value) => set({ globalFilter: value }),

      setVisibleColumns: (columns) => set({ visibleColumns: columns }),

      setCompareTable: (table) => set({ compareTable: table }),

      toggleCompareMode: () => set((state) => ({ isCompareMode: !state.isCompareMode })),

      resetTableState: () =>
        set({
          sorting: [],
          filters: [],
          globalFilter: '',
          visibleColumns: [],
        }),
    }),
    { name: 'table-store' }
  )
)
