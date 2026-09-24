import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express'
import { AppError } from '../errors/app-errors.js'

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    })

    return
  }

  console.error('Unexpected error:', error)

  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  })
}
