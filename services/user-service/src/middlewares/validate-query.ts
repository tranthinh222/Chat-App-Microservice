import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'query',
          message: issue.message,
        })),
      })

      return
    }

    res.locals.validatedQuery = result.data
    next()
  }
}
