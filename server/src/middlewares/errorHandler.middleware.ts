import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }
  if (err instanceof ZodError) {
    res.status(400).json({ message: '입력값이 올바르지 않습니다.', errors: err.flatten() })
    return
  }
  console.error(err)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
}
