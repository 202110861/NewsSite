import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { Prisma } from '@prisma/client'
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
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? '파일 크기는 50MB 이하여야 합니다.'
        : '파일 업로드에 실패했습니다.'
    res.status(400).json({ message })
    return
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Prisma error:', err.code, err.meta)
    res.status(500).json({ message: '데이터베이스 오류가 발생했습니다.' })
    return
  }
  if (
    err instanceof Error &&
    'code' in err &&
    (err as NodeJS.ErrnoException).code === 'EACCES'
  ) {
    console.error('Filesystem permission error:', err)
    res.status(500).json({ message: '업로드 저장 경로에 쓰기 권한이 없습니다.' })
    return
  }
  console.error(err)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
}
