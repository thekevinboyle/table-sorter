import { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useConnectionStore } from '@/stores/connection-store'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { ConnectionDialog } from '@/features/connection/connection-dialog'
import { TableViewer } from '@/features/viewer/table-viewer'
import { CompareView } from '@/features/compare/compare-view'
import { Skeleton } from '@/components/ui/skeleton'

function TableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

function ExplorerPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Select a Table</h2>
        <p>Browse databases and tables in the sidebar to get started</p>
      </div>
    </div>
  )
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isConnected = useConnectionStore((s) => s.isConnected)
  const location = useLocation()

  if (!isConnected) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<TableSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

function HomePage() {
  const isConnected = useConnectionStore((s) => s.isConnected)

  if (isConnected) {
    return <Navigate to="/explore" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ConnectionDialog defaultOpen />
    </div>
  )
}

export default function App() {
  const checkStatus = useConnectionStore((s) => s.checkStatus)

  useEffect(() => {
    // Check connection status on mount
    checkStatus()
  }, [checkStatus])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/explore"
        element={
          <ProtectedLayout>
            <ExplorerPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/table/:db/:schema/:table"
        element={
          <ProtectedLayout>
            <TableViewer />
          </ProtectedLayout>
        }
      />
      <Route
        path="/compare"
        element={
          <ProtectedLayout>
            <CompareView />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
