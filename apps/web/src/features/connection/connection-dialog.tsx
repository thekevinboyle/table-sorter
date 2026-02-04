import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Database } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConnectionStore } from '@/stores/connection-store'

interface ConnectionDialogProps {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConnectionDialog({ defaultOpen, open, onOpenChange }: ConnectionDialogProps) {
  const navigate = useNavigate()
  const { connect, isConnecting, error, clearError } = useConnectionStore()

  const [formData, setFormData] = useState({
    account: '',
    username: '',
    password: '',
    warehouse: '',
    database: '',
    role: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await connect({
        account: formData.account,
        username: formData.username,
        password: formData.password,
        warehouse: formData.warehouse || undefined,
        database: formData.database || undefined,
        role: formData.role || undefined,
      })
      navigate('/explore')
    } catch {
      // Error is handled in store
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError()
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Dialog defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connect to Snowflake
            </DialogTitle>
            <DialogDescription>
              Enter your Snowflake credentials. A browser window will open for MFA/SSO authentication.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account">Account *</Label>
              <Input
                id="account"
                placeholder="your-account.snowflakecomputing.com"
                value={formData.account}
                onChange={handleChange('account')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="your_username"
                value={formData.username}
                onChange={handleChange('username')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password (optional for SSO)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank for browser auth"
                value={formData.password}
                onChange={handleChange('password')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Input
                  id="warehouse"
                  placeholder="COMPUTE_WH"
                  value={formData.warehouse}
                  onChange={handleChange('warehouse')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="database">Database</Label>
                <Input
                  id="database"
                  placeholder="MY_DB"
                  value={formData.database}
                  onChange={handleChange('database')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="ACCOUNTADMIN"
                value={formData.role}
                onChange={handleChange('role')}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isConnecting} className="w-full sm:w-auto">
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
