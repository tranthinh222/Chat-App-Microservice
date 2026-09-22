import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-errors.js'
import {
  tokenService,
  type VerifiedAccessToken,
} from '../services/token.service.js'

declare global {
  namespace Express {
    interface Request {
      auth?: VerifiedAccessToken
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    next(
      new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      ),
    )
    return
  }

  const token = authorization.slice(7).trim()

  if (!token) {
    next(
      new AppError(
        401,
        'ACCESS_TOKEN_REQUIRED',
        'Access token is required',
      ),
    )
    return
  }

  try {
    req.auth = tokenService.verifyAccessToken(token)
    next()
  } catch (error) {
    next(error)
  }
}
