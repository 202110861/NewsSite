import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    role: 'USER' | 'ADMIN'
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: '인증이 필요합니다.' })
    return
  }

  try {
    const payload = verifyAccessToken(header.slice(7))
    req.user = { id: payload.sub, username: payload.username, role: payload.role }
    next()
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
  }
}

export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7))
      req.user = { id: payload.sub, username: payload.username, role: payload.role }
    } catch {
      // ignore invalid token
    }
  }
  next()
}
