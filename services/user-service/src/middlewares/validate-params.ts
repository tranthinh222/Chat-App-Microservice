import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'params',
          message: issue.message,
        })),
      })

      return
    }

    req.params = result.data as Request['params']

    next()
  }
}
