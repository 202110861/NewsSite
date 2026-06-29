import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.middleware.js'

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: '인증이 필요합니다.' })
    return
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: '관리자 권한이 필요합니다.' })
    return
  }
  next()
}
