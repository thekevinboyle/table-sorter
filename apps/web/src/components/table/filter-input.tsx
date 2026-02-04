import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FilterInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function FilterInput({
  value: externalValue,
  onChange,
  placeholder = 'Filter...',
  className,
  debounceMs = 300,
}: FilterInputProps) {
  const [value, setValue] = useState(externalValue)

  // Sync with external value
  useEffect(() => {
    setValue(externalValue)
  }, [externalValue])

  // Debounced update
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== externalValue) {
        onChange(value)
      }
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [value, externalValue, onChange, debounceMs])

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={cn('h-8', className)}
    />
  )
}
