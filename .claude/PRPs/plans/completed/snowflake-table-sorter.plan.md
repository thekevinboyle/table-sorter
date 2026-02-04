# Feature: Snowflake Table Sorter

## Summary

A modern data table application that connects to Snowflake and provides powerful comparison, sorting, filtering, and data exploration capabilities. Built with the latest 2026 stack: React 19, TanStack Table v8 with virtualization, Tailwind CSS 4, shadcn/ui, Hono backend, and Snowflake SDK. Focus on high-performance virtualized tables handling 100k+ rows, real-time filtering, and a slick, responsive UI/UX.

## User Story

As a **data analyst or business user**
I want to **connect to Snowflake, browse tables, compare datasets, and apply advanced sorting/filtering**
So that **I can quickly explore and analyze data without writing SQL queries**

## Problem Statement

Data analysts need to frequently explore Snowflake tables but switching between SQL clients, spreadsheets, and BI tools is friction-heavy. There's no purpose-built tool that provides:
- Direct Snowflake connectivity with secure credential management
- Side-by-side table comparison
- Excel-like filtering and sorting UX
- Performance with large datasets (100k+ rows)

## Solution Statement

Build a fullstack TypeScript application with:
- **Frontend**: React 19 + TanStack Table + TanStack Virtual for 60fps scrolling through massive datasets
- **Backend**: Hono (ultrafast, ~14KB) running on Node.js with Snowflake SDK connection pooling
- **UI**: Tailwind CSS 4 + shadcn/ui (new-york style) with OKLCH colors and tw-animate-css
- **State**: Zustand for global app state + TanStack Query v5 for server state
- **Architecture**: Monorepo structure with shared types between frontend and backend

## Metadata

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Type             | NEW_CAPABILITY                                                          |
| Complexity       | HIGH                                                                    |
| Systems Affected | Frontend (React SPA), Backend (Hono API), Database (Snowflake)          |
| Dependencies     | snowflake-sdk@2.3.3, @tanstack/react-table@8.21.3, @tanstack/react-virtual@3.13.18, @tanstack/react-query@5.90.19, hono@latest, tailwindcss@4, zod@latest |
| Estimated Tasks  | 24                                                                      |

---

## UX Design

### Before State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              BEFORE STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐            ║
║   │  Snowflake  │ ──────► │  SQL Client │ ──────► │   Export    │            ║
║   │   Console   │         │   (Manual)  │         │   to CSV    │            ║
║   └─────────────┘         └─────────────┘         └─────────────┘            ║
║          │                       │                       │                    ║
║          ▼                       ▼                       ▼                    ║
║   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐            ║
║   │Write Queries│         │ Copy/Paste  │         │   Excel/    │            ║
║   │  by Hand    │         │   Results   │         │   Sheets    │            ║
║   └─────────────┘         └─────────────┘         └─────────────┘            ║
║                                                                               ║
║   USER_FLOW:                                                                  ║
║   1. Open Snowflake console                                                   ║
║   2. Write SQL query manually                                                 ║
║   3. Execute and wait for results                                             ║
║   4. Export to CSV or copy data                                               ║
║   5. Open Excel/Sheets for sorting/filtering                                  ║
║   6. Repeat for each table comparison                                         ║
║                                                                               ║
║   PAIN_POINT: Context switching, manual queries, no visual comparison         ║
║   DATA_FLOW: Snowflake → SQL → CSV → Spreadsheet (fragmented)                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                               AFTER STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐     ║
║   │                     TABLE SORTER APPLICATION                         │     ║
║   ├─────────────────────────────────────────────────────────────────────┤     ║
║   │  ┌──────────────┐  ┌──────────────────────────────────────────┐     │     ║
║   │  │  CONNECTION  │  │              DATA EXPLORER                │     │     ║
║   │  │    PANEL     │  │  ┌────────────────┬────────────────┐     │     │     ║
║   │  ├──────────────┤  │  │    TABLE A     │    TABLE B     │     │     │     ║
║   │  │ • Account    │  │  ├────────────────┼────────────────┤     │     │     ║
║   │  │ • Warehouse  │  │  │ [Sort][Filter] │ [Sort][Filter] │     │     │     ║
║   │  │ • Database   │  │  │ ────────────── │ ────────────── │     │     │     ║
║   │  │ • Schema     │  │  │ │ Virtualized│ │ │ Virtualized│ │     │     │     ║
║   │  ├──────────────┤  │  │ │   Rows     │ │ │   Rows     │ │     │     │     ║
║   │  │  TABLE LIST  │  │  │ │  100k+     │ │ │  100k+     │ │     │     │     ║
║   │  │ ○ customers  │  │  │ │  @ 60fps   │ │ │  @ 60fps   │ │     │     │     ║
║   │  │ ○ orders     │  │  │ └────────────┘ │ └────────────┘ │     │     │     ║
║   │  │ ○ products   │  │  └────────────────┴────────────────┘     │     │     ║
║   │  └──────────────┘  │  ┌────────────────────────────────────┐  │     │     ║
║   │                    │  │  COMPARISON RESULTS / DIFF VIEW    │  │     │     ║
║   │                    │  └────────────────────────────────────┘  │     │     ║
║   │                    └──────────────────────────────────────────┘     │     ║
║   └─────────────────────────────────────────────────────────────────────┘     ║
║                                                                               ║
║   USER_FLOW:                                                                  ║
║   1. Enter Snowflake credentials (stored securely)                            ║
║   2. Browse databases/schemas visually                                        ║
║   3. Click table to load with instant virtualized rendering                   ║
║   4. Sort/filter with Excel-like UX (click headers, type in filter box)       ║
║   5. Open second table in split view for comparison                           ║
║   6. Highlight differences, export results                                    ║
║                                                                               ║
║   VALUE_ADD: Single tool, no SQL needed, 60fps with 100k+ rows                ║
║   DATA_FLOW: Snowflake → Hono API → React Query → Virtualized Table           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes

| Location             | Before                    | After                          | User Impact                                |
| -------------------- | ------------------------- | ------------------------------ | ------------------------------------------ |
| `/`                  | N/A                       | Connection setup wizard        | One-time secure credential entry           |
| `/explore`           | N/A                       | Database/schema browser        | Visual navigation instead of SQL           |
| `/table/:id`         | Write SQL manually        | Click to load, auto-virtualize | Instant data viewing, 60fps scrolling      |
| `/compare`           | Export both, use Excel    | Side-by-side split view        | Real-time visual diff                      |
| Column headers       | N/A                       | Click to sort (multi-column)   | Excel-like sorting UX                      |
| Filter row           | Write WHERE clause        | Type to filter, dropdowns      | No SQL knowledge required                  |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these external docs before starting:**

| Priority | Source                                                                                       | Section                  | Why Read This                                |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------- |
| P0       | [TanStack Table v8 Virtualization](https://tanstack.com/table/v8/docs/guide/virtualization)  | Row Virtualization       | Core pattern for 100k+ row performance       |
| P0       | [Snowflake Node.js Driver](https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver) | Connection Management | Connection pooling with eviction             |
| P0       | [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)                              | Setup & Migration        | OKLCH colors, tw-animate-css, @theme directive |
| P1       | [Hono Best Practices](https://hono.dev/docs/guides/best-practices)                           | All                      | API structure, middleware, Zod validation    |
| P1       | [TanStack Query v5 Overview](https://tanstack.com/query/v5/docs/react/overview)              | Suspense, Prefetching    | useSuspenseQuery, request waterfall prevention |
| P2       | [Zustand Docs](https://zustand.docs.pmnd.rs/getting-started/comparison)                      | Selectors                | Manual render optimization with selectors    |

---

## Patterns to Mirror

Since this is a greenfield project, we establish patterns from best practices:

**PROJECT_STRUCTURE:**
```
table-sorter/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   ├── table/      # TanStack Table components
│   │   │   │   └── layout/     # Layout components
│   │   │   ├── features/
│   │   │   │   ├── connection/ # Snowflake connection UI
│   │   │   │   ├── explorer/   # Database/table browser
│   │   │   │   ├── viewer/     # Table data viewer
│   │   │   │   └── compare/    # Table comparison
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── lib/            # Utilities
│   │   │   └── App.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                    # Hono backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── connection.ts
│       │   │   ├── databases.ts
│       │   │   ├── tables.ts
│       │   │   └── query.ts
│       │   ├── services/
│       │   │   └── snowflake.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── error.ts
│       │   ├── schemas/        # Zod schemas
│       │   └── index.ts
│       └── package.json
├── packages/
│   └── shared/                 # Shared types
│       ├── src/
│       │   ├── types.ts
│       │   └── schemas.ts
│       └── package.json
├── package.json                # Workspace root
├── pnpm-workspace.yaml
└── tsconfig.json
```

**NAMING_CONVENTION:**
```typescript
// Files: kebab-case
// table-viewer.tsx, use-snowflake-connection.ts

// Components: PascalCase
export function TableViewer({ ... }) { }

// Hooks: camelCase with use- prefix
export function useSnowflakeConnection() { }

// Stores: camelCase with -store suffix
export const useConnectionStore = create<ConnectionStore>()

// API routes: kebab-case paths
app.get('/api/databases/:databaseName/tables', ...)

// Types: PascalCase
type SnowflakeConnection = { ... }
interface TableMetadata { ... }
```

**ERROR_HANDLING (Hono):**
```typescript
// SOURCE: Hono best practices
import { HTTPException } from 'hono/http-exception'

// Custom error with status code
throw new HTTPException(404, { message: 'Table not found' })

// Global error handler middleware
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})
```

**VALIDATION_PATTERN (Zod + Hono):**
```typescript
// SOURCE: Hono Zod validator
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const ConnectionSchema = z.object({
  account: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  warehouse: z.string().optional(),
  database: z.string().optional(),
})

app.post('/api/connect',
  zValidator('json', ConnectionSchema),
  async (c) => {
    const data = c.req.valid('json') // Fully typed!
    // ...
  }
)
```

**TANSTACK_TABLE_PATTERN:**
```typescript
// SOURCE: TanStack Table v8 docs
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedTable({ data, columns }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // row height
    overscan: 10,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              {/* render row cells */}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**ZUSTAND_STORE_PATTERN:**
```typescript
// SOURCE: Zustand docs - selector pattern for render optimization
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ConnectionState {
  isConnected: boolean
  account: string | null
  databases: string[]
  connect: (config: ConnectionConfig) => Promise<void>
  disconnect: () => void
}

export const useConnectionStore = create<ConnectionState>()(
  devtools(
    (set, get) => ({
      isConnected: false,
      account: null,
      databases: [],
      connect: async (config) => {
        // API call...
        set({ isConnected: true, account: config.account })
      },
      disconnect: () => set({ isConnected: false, account: null, databases: [] }),
    }),
    { name: 'connection-store' }
  )
)

// Usage with selector to prevent re-renders
const isConnected = useConnectionStore((s) => s.isConnected)
```

**TANSTACK_QUERY_PATTERN:**
```typescript
// SOURCE: TanStack Query v5 docs
import { useQuery, useSuspenseQuery, queryOptions } from '@tanstack/react-query'

// Define query options for reuse
export const tableDataOptions = (tableId: string) =>
  queryOptions({
    queryKey: ['table', tableId],
    queryFn: () => fetchTableData(tableId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

// In component - use suspense for loading states
function TableViewer({ tableId }: { tableId: string }) {
  const { data } = useSuspenseQuery(tableDataOptions(tableId))
  // data is always defined, no loading check needed
  return <VirtualizedTable data={data} />
}

// Wrap with Suspense boundary
<Suspense fallback={<TableSkeleton />}>
  <TableViewer tableId={tableId} />
</Suspense>
```

**TAILWIND_CSS_4_PATTERN:**
```css
/* SOURCE: shadcn/ui Tailwind v4 docs */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... more mappings */
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

---

## Files to Create

### Root Configuration

| File                  | Action | Justification                              |
| --------------------- | ------ | ------------------------------------------ |
| `package.json`        | CREATE | pnpm workspace root config                 |
| `pnpm-workspace.yaml` | CREATE | Define workspace packages                  |
| `tsconfig.json`       | CREATE | Base TypeScript config                     |
| `.gitignore`          | CREATE | Ignore node_modules, env files             |
| `.env.example`        | CREATE | Document required env vars                 |

### Shared Package

| File                              | Action | Justification                 |
| --------------------------------- | ------ | ----------------------------- |
| `packages/shared/package.json`    | CREATE | Shared types package          |
| `packages/shared/tsconfig.json`   | CREATE | TypeScript config             |
| `packages/shared/src/types.ts`    | CREATE | Shared TypeScript types       |
| `packages/shared/src/schemas.ts`  | CREATE | Shared Zod schemas            |
| `packages/shared/src/index.ts`    | CREATE | Package exports               |

### API (Hono Backend)

| File                                    | Action | Justification                      |
| --------------------------------------- | ------ | ---------------------------------- |
| `apps/api/package.json`                 | CREATE | API dependencies                   |
| `apps/api/tsconfig.json`                | CREATE | TypeScript config                  |
| `apps/api/src/index.ts`                 | CREATE | Hono app entry point               |
| `apps/api/src/services/snowflake.ts`    | CREATE | Snowflake connection pool service  |
| `apps/api/src/routes/connection.ts`     | CREATE | Connection test/management routes  |
| `apps/api/src/routes/databases.ts`      | CREATE | List databases/schemas routes      |
| `apps/api/src/routes/tables.ts`         | CREATE | Table metadata/data routes         |
| `apps/api/src/middleware/error.ts`      | CREATE | Global error handler               |
| `apps/api/src/schemas/index.ts`         | CREATE | API-specific Zod schemas           |

### Web (React Frontend)

| File                                                    | Action | Justification                    |
| ------------------------------------------------------- | ------ | -------------------------------- |
| `apps/web/package.json`                                 | CREATE | Frontend dependencies            |
| `apps/web/tsconfig.json`                                | CREATE | TypeScript config                |
| `apps/web/vite.config.ts`                               | CREATE | Vite configuration               |
| `apps/web/index.html`                                   | CREATE | HTML entry point                 |
| `apps/web/postcss.config.js`                            | CREATE | PostCSS for Tailwind             |
| `apps/web/src/main.tsx`                                 | CREATE | React entry point                |
| `apps/web/src/App.tsx`                                  | CREATE | Main App with routing            |
| `apps/web/src/globals.css`                              | CREATE | Tailwind CSS 4 + theme           |
| `apps/web/src/lib/utils.ts`                             | CREATE | cn() utility for shadcn          |
| `apps/web/src/lib/api.ts`                               | CREATE | API client with fetch            |
| `apps/web/src/stores/connection-store.ts`               | CREATE | Zustand connection state         |
| `apps/web/src/stores/table-store.ts`                    | CREATE | Zustand table view state         |
| `apps/web/src/hooks/use-table-data.ts`                  | CREATE | TanStack Query hook for data     |
| `apps/web/src/components/ui/button.tsx`                 | CREATE | shadcn Button component          |
| `apps/web/src/components/ui/input.tsx`                  | CREATE | shadcn Input component           |
| `apps/web/src/components/ui/card.tsx`                   | CREATE | shadcn Card component            |
| `apps/web/src/components/ui/dialog.tsx`                 | CREATE | shadcn Dialog component          |
| `apps/web/src/components/ui/dropdown-menu.tsx`          | CREATE | shadcn Dropdown component        |
| `apps/web/src/components/ui/skeleton.tsx`               | CREATE | shadcn Skeleton component        |
| `apps/web/src/components/table/data-table.tsx`          | CREATE | Main virtualized table component |
| `apps/web/src/components/table/column-header.tsx`       | CREATE | Sortable column header           |
| `apps/web/src/components/table/filter-input.tsx`        | CREATE | Column filter input              |
| `apps/web/src/components/layout/sidebar.tsx`            | CREATE | Database/table navigation        |
| `apps/web/src/components/layout/header.tsx`             | CREATE | App header with connection status|
| `apps/web/src/features/connection/connection-dialog.tsx`| CREATE | Snowflake connection form        |
| `apps/web/src/features/explorer/database-tree.tsx`      | CREATE | Database/schema/table tree       |
| `apps/web/src/features/viewer/table-viewer.tsx`         | CREATE | Single table view page           |
| `apps/web/src/features/compare/compare-view.tsx`        | CREATE | Side-by-side table comparison    |

---

## NOT Building (Scope Limits)

Explicit exclusions to prevent scope creep:

- **Authentication system** - v1 stores credentials in memory/localStorage only, no user accounts
- **Query builder UI** - Users work with existing tables, no custom SQL in v1
- **Data export** - No CSV/Excel export in v1 (can add later)
- **Saved connections** - No persistent connection profiles in v1
- **Data editing** - Read-only in v1, no INSERT/UPDATE/DELETE
- **Multiple simultaneous connections** - One Snowflake connection at a time
- **Mobile responsive** - Desktop-first, no mobile optimization in v1
- **Unit tests** - Focus on E2E validation in v1, add unit tests in v2
- **CI/CD pipeline** - Manual deployment in v1

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

### Phase 1: Project Foundation

#### Task 1: CREATE Monorepo Structure

- **ACTION**: Initialize pnpm workspace with root package.json
- **IMPLEMENT**:
  ```json
  {
    "name": "table-sorter",
    "private": true,
    "scripts": {
      "dev": "pnpm -r dev",
      "dev:api": "pnpm --filter api dev",
      "dev:web": "pnpm --filter web dev",
      "build": "pnpm -r build",
      "lint": "pnpm -r lint",
      "type-check": "pnpm -r type-check"
    },
    "devDependencies": {
      "typescript": "^5.7.0"
    }
  }
  ```
- **FILES**: `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `.gitignore`
- **VALIDATE**: `pnpm install` completes without errors

#### Task 2: CREATE Shared Types Package

- **ACTION**: Set up shared package with types and Zod schemas
- **IMPLEMENT**: Types for SnowflakeConnection, TableMetadata, ColumnInfo, QueryResult
- **FILES**: `packages/shared/package.json`, `packages/shared/src/types.ts`, `packages/shared/src/schemas.ts`, `packages/shared/src/index.ts`
- **VALIDATE**: `pnpm --filter shared type-check`

### Phase 2: Backend API

#### Task 3: CREATE Hono API Scaffold

- **ACTION**: Initialize Hono application with Node.js adapter
- **IMPLEMENT**: Entry point with CORS, logging middleware, health check route
- **DEPS**: `hono`, `@hono/node-server`, `@hono/zod-validator`, `zod`
- **FILES**: `apps/api/package.json`, `apps/api/src/index.ts`
- **VALIDATE**: `pnpm --filter api dev` starts server, `curl localhost:3001/health` returns 200

#### Task 4: CREATE Snowflake Service

- **ACTION**: Implement Snowflake connection pool service
- **IMPLEMENT**:
  - Connection pool with evictionRunIntervalMillis
  - clientSessionKeepAlive for long-running connections
  - Methods: connect, disconnect, executeQuery, getMetadata
- **DEPS**: `snowflake-sdk`
- **FILES**: `apps/api/src/services/snowflake.ts`
- **GOTCHA**: Set evictionRunIntervalMillis > 0 to avoid stale connections
- **VALIDATE**: Manual test with real Snowflake credentials

#### Task 5: CREATE Connection Routes

- **ACTION**: Implement connection test and management endpoints
- **IMPLEMENT**:
  - `POST /api/connect` - Test connection with credentials
  - `POST /api/disconnect` - Close connection pool
  - `GET /api/connection/status` - Check connection state
- **FILES**: `apps/api/src/routes/connection.ts`, `apps/api/src/schemas/index.ts`
- **VALIDATE**: `curl -X POST localhost:3001/api/connect -d '...'` with valid creds

#### Task 6: CREATE Database Routes

- **ACTION**: Implement database/schema browsing endpoints
- **IMPLEMENT**:
  - `GET /api/databases` - List all databases
  - `GET /api/databases/:db/schemas` - List schemas in database
  - `GET /api/databases/:db/schemas/:schema/tables` - List tables in schema
- **FILES**: `apps/api/src/routes/databases.ts`
- **VALIDATE**: Test endpoints return expected structure

#### Task 7: CREATE Table Data Routes

- **ACTION**: Implement table data fetching with pagination
- **IMPLEMENT**:
  - `GET /api/tables/:db/:schema/:table/metadata` - Column info, row count
  - `GET /api/tables/:db/:schema/:table/data` - Paginated rows (limit/offset)
  - Support server-side sorting (ORDER BY)
- **FILES**: `apps/api/src/routes/tables.ts`
- **GOTCHA**: Limit default to 1000 rows, max 10000 per request
- **VALIDATE**: Returns data with correct types

#### Task 8: CREATE Error Handling Middleware

- **ACTION**: Global error handler with typed responses
- **IMPLEMENT**: Catch HTTPException, log errors, return consistent JSON
- **FILES**: `apps/api/src/middleware/error.ts`
- **VALIDATE**: Intentional errors return proper JSON response

### Phase 3: Frontend Foundation

#### Task 9: CREATE Vite + React 19 Scaffold

- **ACTION**: Initialize React 19 app with Vite and TypeScript
- **IMPLEMENT**: Basic Vite config with path aliases, React 19 entry
- **DEPS**: `react@19`, `react-dom@19`, `vite`, `@vitejs/plugin-react`
- **FILES**: `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/index.html`, `apps/web/src/main.tsx`
- **VALIDATE**: `pnpm --filter web dev` starts dev server

#### Task 10: CREATE Tailwind CSS 4 + shadcn/ui Setup

- **ACTION**: Configure Tailwind CSS 4 with OKLCH colors and tw-animate-css
- **IMPLEMENT**:
  - CSS-first config in globals.css with @theme directive
  - OKLCH color variables for light/dark mode
  - shadcn utilities (cn function)
- **DEPS**: `tailwindcss@4`, `@tailwindcss/postcss`, `postcss`, `tw-animate-css`, `clsx`, `tailwind-merge`
- **FILES**: `apps/web/postcss.config.js`, `apps/web/src/globals.css`, `apps/web/src/lib/utils.ts`
- **VALIDATE**: Tailwind classes render correctly

#### Task 11: CREATE Base shadcn/ui Components

- **ACTION**: Add essential shadcn components (new-york style)
- **IMPLEMENT**: Button, Input, Card, Dialog, DropdownMenu, Skeleton
- **GOTCHA**: Use data-slot attributes, no forwardRef (React 19)
- **FILES**: `apps/web/src/components/ui/*.tsx`
- **VALIDATE**: Components render with correct styling

#### Task 12: CREATE TanStack Query Provider

- **ACTION**: Set up React Query with devtools
- **IMPLEMENT**: QueryClient with staleTime defaults, QueryClientProvider
- **DEPS**: `@tanstack/react-query`, `@tanstack/react-query-devtools`
- **FILES**: Update `apps/web/src/main.tsx`, `apps/web/src/App.tsx`
- **VALIDATE**: React Query devtools visible in dev mode

#### Task 13: CREATE Zustand Stores

- **ACTION**: Implement global state stores
- **IMPLEMENT**:
  - connectionStore: isConnected, credentials, connect/disconnect
  - tableStore: activeTable, sorting, filtering, selected columns
- **DEPS**: `zustand`
- **FILES**: `apps/web/src/stores/connection-store.ts`, `apps/web/src/stores/table-store.ts`
- **VALIDATE**: State updates reflect in components

#### Task 14: CREATE API Client

- **ACTION**: Type-safe fetch wrapper for backend API
- **IMPLEMENT**: Base fetch with error handling, typed endpoints
- **FILES**: `apps/web/src/lib/api.ts`
- **VALIDATE**: API calls return typed responses

### Phase 4: Core Table Components

#### Task 15: CREATE Virtualized DataTable Component

- **ACTION**: Build main table with TanStack Table + Virtual
- **IMPLEMENT**:
  - useReactTable with getCoreRowModel, getSortedRowModel, getFilteredRowModel
  - useVirtualizer for row virtualization
  - Absolute positioning for virtual rows
  - Handle 100k+ rows at 60fps
- **DEPS**: `@tanstack/react-table@8`, `@tanstack/react-virtual@3`
- **FILES**: `apps/web/src/components/table/data-table.tsx`
- **GOTCHA**: Set overscan to 10-20 for smooth scrolling
- **VALIDATE**: Renders 10k rows without jank

#### Task 16: CREATE Sortable Column Header

- **ACTION**: Clickable column header with sort indicators
- **IMPLEMENT**: Multi-column sort support, asc/desc/none cycle, visual indicators
- **FILES**: `apps/web/src/components/table/column-header.tsx`
- **VALIDATE**: Clicking cycles through sort states

#### Task 17: CREATE Column Filter Input

- **ACTION**: Per-column text filter with debounce
- **IMPLEMENT**: Debounced input (300ms), filter by contains/equals
- **FILES**: `apps/web/src/components/table/filter-input.tsx`
- **VALIDATE**: Filtering updates table reactively

#### Task 18: CREATE Table Data Hook

- **ACTION**: TanStack Query hook for fetching table data
- **IMPLEMENT**: useSuspenseQuery with queryOptions pattern, prefetching
- **FILES**: `apps/web/src/hooks/use-table-data.ts`
- **VALIDATE**: Data loads with Suspense fallback

### Phase 5: Feature Pages

#### Task 19: CREATE Connection Dialog

- **ACTION**: Modal form for Snowflake credentials
- **IMPLEMENT**: Account, username, password, warehouse, database fields
- **FILES**: `apps/web/src/features/connection/connection-dialog.tsx`
- **VALIDATE**: Form submits and connects to Snowflake

#### Task 20: CREATE Database Tree Browser

- **ACTION**: Expandable tree for database/schema/table navigation
- **IMPLEMENT**: Lazy-load schemas on database expand, tables on schema expand
- **FILES**: `apps/web/src/features/explorer/database-tree.tsx`
- **VALIDATE**: Tree expands and loads data correctly

#### Task 21: CREATE Layout Components

- **ACTION**: App shell with header and sidebar
- **IMPLEMENT**:
  - Header: connection status, dark mode toggle
  - Sidebar: database tree, collapsible
- **FILES**: `apps/web/src/components/layout/header.tsx`, `apps/web/src/components/layout/sidebar.tsx`
- **VALIDATE**: Layout renders correctly, sidebar toggles

#### Task 22: CREATE Table Viewer Page

- **ACTION**: Full page for viewing single table
- **IMPLEMENT**: Table metadata display, virtualized data table, filter row
- **FILES**: `apps/web/src/features/viewer/table-viewer.tsx`
- **VALIDATE**: Table loads and displays with sorting/filtering

#### Task 23: CREATE Compare View

- **ACTION**: Side-by-side table comparison
- **IMPLEMENT**: Split view with two DataTables, synchronized scrolling option
- **FILES**: `apps/web/src/features/compare/compare-view.tsx`
- **VALIDATE**: Two tables render side by side

#### Task 24: CREATE App Router

- **ACTION**: Set up React Router with routes
- **IMPLEMENT**:
  - `/` - Connection page (if not connected) or redirect to explore
  - `/explore` - Database browser
  - `/table/:db/:schema/:table` - Table viewer
  - `/compare` - Comparison view
- **DEPS**: `react-router-dom`
- **FILES**: Update `apps/web/src/App.tsx`
- **VALIDATE**: Navigation works between all routes

---

## Testing Strategy

### Manual Testing Checklist

| Scenario                      | Steps                                               | Expected Result                |
| ----------------------------- | --------------------------------------------------- | ------------------------------ |
| Fresh start                   | Open app with no connection                         | Connection dialog appears      |
| Connect to Snowflake          | Enter valid creds, click Connect                    | Success toast, redirect to /explore |
| Invalid credentials           | Enter wrong password                                | Error message displayed        |
| Browse databases              | Click database in tree                              | Schemas load and display       |
| Load table                    | Click table name                                    | Table data loads with virtualization |
| Sort column                   | Click column header                                 | Data sorts, indicator shows    |
| Multi-column sort             | Shift+click second column                           | Secondary sort applied         |
| Filter column                 | Type in filter input                                | Rows filter in real-time       |
| Large dataset                 | Load table with 100k+ rows                          | Smooth 60fps scrolling         |
| Compare tables                | Open two tables in compare view                     | Side-by-side display works     |
| Dark mode                     | Toggle dark mode                                    | All components switch correctly |
| Disconnect                    | Click disconnect button                             | Returns to connection dialog   |

### Edge Cases Checklist

- [ ] Empty table (0 rows)
- [ ] Table with 1 row
- [ ] Table with 500k+ rows
- [ ] Column with null values
- [ ] Column with very long text
- [ ] Unicode/emoji in data
- [ ] Connection timeout
- [ ] Network disconnect during query
- [ ] Very wide table (50+ columns)
- [ ] Column names with special characters

---

## Validation Commands

### Level 1: STATIC_ANALYSIS

```bash
pnpm lint && pnpm type-check
```

**EXPECT**: Exit 0, no TypeScript errors

### Level 2: BUILD

```bash
pnpm build
```

**EXPECT**: Both apps build successfully

### Level 3: DEV_SERVER

```bash
pnpm dev
```

**EXPECT**: API on :3001, Web on :5173, both accessible

### Level 4: MANUAL_VALIDATION

Follow the Manual Testing Checklist above with real Snowflake connection.

---

## Acceptance Criteria

- [ ] User can connect to Snowflake with account/username/password
- [ ] User can browse databases, schemas, and tables in tree view
- [ ] User can click table to view data with instant virtualized rendering
- [ ] User can sort by clicking column headers (single and multi-column)
- [ ] User can filter columns with text input
- [ ] Table handles 100k+ rows at 60fps scroll performance
- [ ] User can compare two tables side-by-side
- [ ] Dark mode works throughout the app
- [ ] All builds pass without errors

---

## Completion Checklist

- [ ] All 24 tasks completed in dependency order
- [ ] Each task validated immediately after completion
- [ ] Level 1: Static analysis (lint + type-check) passes
- [ ] Level 2: Build succeeds for both apps
- [ ] Level 3: Dev servers start correctly
- [ ] Level 4: Manual testing checklist passes
- [ ] All acceptance criteria met

---

## Risks and Mitigations

| Risk                                       | Likelihood | Impact | Mitigation                                              |
| ------------------------------------------ | ---------- | ------ | ------------------------------------------------------- |
| Snowflake SDK incompatibility with Hono    | LOW        | HIGH   | SDK uses callbacks; wrap in Promises                    |
| TanStack Virtual perf issues with 500k rows| MED        | HIGH   | Implement server-side pagination, limit client to 100k  |
| Tailwind CSS 4 breaking changes            | LOW        | MED    | Pin versions, follow official upgrade guide             |
| React 19 compatibility with shadcn         | LOW        | MED    | Use latest shadcn with data-slot, no forwardRef         |
| Connection pool memory leaks               | MED        | MED    | Set evictionRunIntervalMillis, monitor memory           |
| Large response payloads from Snowflake     | HIGH       | MED    | Paginate all queries, stream if needed                  |

---

## Notes

### Technology Choices Rationale

- **Hono over Express**: 14KB vs 500KB+, first-class TypeScript, Web Standard APIs
- **Zustand over Redux**: Minimal boilerplate, selector-based render optimization, only 1.2KB
- **TanStack Query over SWR**: Better devtools, suspense support, query invalidation
- **TanStack Table over AG-Grid**: Free, headless (full styling control), better DX
- **Tailwind CSS 4**: CSS-first config, OKLCH colors, faster builds, no config file
- **pnpm**: Faster, disk-efficient, strict dependency resolution

### Future Enhancements (v2)

- CSV/Excel export
- Saved connection profiles (encrypted localStorage)
- Custom SQL query builder
- Column visibility toggles
- Row selection with bulk actions
- Data diff highlighting in compare view
- Keyboard shortcuts (vim-style navigation)

### Performance Targets

- Initial page load: < 2s
- Table render (10k rows): < 500ms
- Scroll performance: 60fps
- Filter debounce: 300ms
- API response: < 1s for metadata, < 3s for data

---

## External Documentation References

- [TanStack Table v8 Virtualization Guide](https://tanstack.com/table/v8/docs/guide/virtualization)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [TanStack Query v5 Overview](https://tanstack.com/query/v5/docs/react/overview)
- [Snowflake Node.js Driver - Connection Management](https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver-connect)
- [Hono Best Practices](https://hono.dev/docs/guides/best-practices)
- [shadcn/ui Tailwind v4 Setup](https://ui.shadcn.com/docs/tailwind-v4)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zustand Comparison](https://zustand.docs.pmnd.rs/getting-started/comparison)
