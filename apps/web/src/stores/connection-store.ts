import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SnowflakeConnectionConfig, ConnectionStatus } from '@table-sorter/shared'
import { api } from '@/lib/api'

interface ConnectionState {
  // State
  isConnected: boolean
  isConnecting: boolean
  account: string | null
  warehouse: string | null
  database: string | null
  schema: string | null
  error: string | null

  // Actions
  connect: (config: SnowflakeConnectionConfig) => Promise<void>
  disconnect: () => Promise<void>
  checkStatus: () => Promise<void>
  clearError: () => void
}

export const useConnectionStore = create<ConnectionState>()(
  devtools(
    (set) => ({
      // Initial state
      isConnected: false,
      isConnecting: false,
      account: null,
      warehouse: null,
      database: null,
      schema: null,
      error: null,

      // Actions
      connect: async (config) => {
        set({ isConnecting: true, error: null })
        try {
          const status = await api.connect(config)
          set({
            isConnected: status.isConnected,
            account: status.account,
            warehouse: status.warehouse,
            database: status.database,
            schema: status.schema,
            isConnecting: false,
          })
        } catch (err) {
          set({
            isConnecting: false,
            error: err instanceof Error ? err.message : 'Connection failed',
          })
          throw err
        }
      },

      disconnect: async () => {
        try {
          await api.disconnect()
          set({
            isConnected: false,
            account: null,
            warehouse: null,
            database: null,
            schema: null,
            error: null,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Disconnect failed',
          })
        }
      },

      checkStatus: async () => {
        try {
          const status = await api.getConnectionStatus()
          set({
            isConnected: status.isConnected,
            account: status.account,
            warehouse: status.warehouse,
            database: status.database,
            schema: status.schema,
          })
        } catch {
          set({ isConnected: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'connection-store' }
  )
)
