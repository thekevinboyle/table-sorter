import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status
    )
  }

  // Snowflake SDK errors
  if (err && typeof err === 'object' && 'code' in err) {
    const snowflakeError = err as { code: string; message: string }
    return c.json(
      {
        success: false,
        error: snowflakeError.message,
        code: snowflakeError.code,
      },
      400
    )
  }

  // Generic errors
  const message = err instanceof Error ? err.message : 'Internal server error'
  return c.json(
    {
      success: false,
      error: message,
    },
    500
  )
}
