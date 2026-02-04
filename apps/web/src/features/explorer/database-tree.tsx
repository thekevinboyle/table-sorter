import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Database, FolderOpen, Table2, Loader2 } from 'lucide-react'
import { useDatabases, useSchemas, useTables } from '@/hooks/use-table-data'
import { cn } from '@/lib/utils'

interface TreeNodeProps {
  label: string
  icon: React.ReactNode
  isExpanded?: boolean
  isLoading?: boolean
  onToggle?: () => void
  onClick?: () => void
  children?: React.ReactNode
  level?: number
}

function TreeNode({
  label,
  icon,
  isExpanded,
  isLoading,
  onToggle,
  onClick,
  children,
  level = 0,
}: TreeNodeProps) {
  const hasChildren = !!children || onToggle

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 hover:bg-accent rounded-sm cursor-pointer text-sm',
          'transition-colors'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (onClick) onClick()
          else if (onToggle) onToggle()
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle?.()
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-muted-foreground">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {isExpanded && children && <div>{children}</div>}
    </div>
  )
}

interface SchemaNodeProps {
  database: string
  schema: string
  level: number
}

function SchemaNode({ database, schema, level }: SchemaNodeProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: tables, isLoading } = useTables(database, schema)

  return (
    <TreeNode
      label={schema}
      icon={<FolderOpen className="h-4 w-4" />}
      isExpanded={isExpanded}
      isLoading={isLoading && isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      level={level}
    >
      {tables?.map((table) => (
        <TreeNode
          key={table.name}
          label={table.name}
          icon={<Table2 className="h-4 w-4" />}
          onClick={() => navigate(`/table/${database}/${schema}/${table.name}`)}
          level={level + 1}
        />
      ))}
      {tables?.length === 0 && (
        <div
          className="text-sm text-muted-foreground py-1"
          style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
        >
          No tables
        </div>
      )}
    </TreeNode>
  )
}

interface DatabaseNodeProps {
  database: string
  level: number
}

function DatabaseNode({ database, level }: DatabaseNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: schemas, isLoading } = useSchemas(database)

  return (
    <TreeNode
      label={database}
      icon={<Database className="h-4 w-4" />}
      isExpanded={isExpanded}
      isLoading={isLoading && isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      level={level}
    >
      {schemas?.map((schema) => (
        <SchemaNode
          key={schema.name}
          database={database}
          schema={schema.name}
          level={level + 1}
        />
      ))}
      {schemas?.length === 0 && (
        <div
          className="text-sm text-muted-foreground py-1"
          style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
        >
          No schemas
        </div>
      )}
    </TreeNode>
  )
}

export function DatabaseTree() {
  const { data: databases, isLoading, error } = useDatabases()

  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading databases...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to load databases: {error.message}
      </div>
    )
  }

  if (!databases || databases.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No databases found
      </div>
    )
  }

  return (
    <div className="py-2">
      {databases.map((db) => (
        <DatabaseNode key={db.name} database={db.name} level={0} />
      ))}
    </div>
  )
}
