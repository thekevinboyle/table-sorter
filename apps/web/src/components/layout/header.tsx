import { useNavigate } from 'react-router-dom'
import { Database, LogOut, Moon, Sun, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConnectionStore } from '@/stores/connection-store'
import { useTableStore } from '@/stores/table-store'
import { useState, useEffect } from 'react'

export function Header() {
  const navigate = useNavigate()
  const { account, warehouse, disconnect } = useConnectionStore()
  const { isCompareMode, toggleCompareMode } = useTableStore()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const handleDisconnect = async () => {
    await disconnect()
    navigate('/')
  }

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <Database className="h-5 w-5" />
            <span>Table Sorter</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {account && (
              <>
                <span className="font-medium">{account}</span>
                {warehouse && <span className="ml-2">/ {warehouse}</span>}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isCompareMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={toggleCompareMode}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {account}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">Connected as {account}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDisconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
