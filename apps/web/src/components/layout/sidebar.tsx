import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatabaseTree } from '@/features/explorer/database-tree'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'border-r bg-muted/30 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-12' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-2 border-b">
        {!isCollapsed && (
          <span className="text-sm font-medium px-2">Explorer</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-auto">
          <DatabaseTree />
        </div>
      )}
    </aside>
  )
}
