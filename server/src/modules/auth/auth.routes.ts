import { Router } from 'express'
import { env } from '../../config/env.js'
import { authMiddleware, type AuthRequest } from '../../middlewares/auth.middleware.js'
import * as authService from './auth.service.js'
import * as engagementService from '../engagement/engagement.service.js'
import { checkUsernameSchema, loginSchema, signupSchema } from './auth.validation.js'

const REFRESH_COOKIE = 'refreshToken'

function setRefreshCookie(res: import('express').Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  })
}

export const authRouter = Router()

authRouter.get('/check-username', async (req, res, next) => {
  try {
    const { username } = checkUsernameSchema.parse({ username: req.query.username })
    const result = await authService.checkUsernameAvailable(username)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

authRouter.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = signupSchema.parse(req.body)
    const user = await authService.signup(username, password)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body)
    const result = await authService.login(username, password)
    setRefreshCookie(res, result.refreshToken)
    res.json({ accessToken: result.accessToken, user: result.user })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (!token) {
      res.status(401).json({ message: 'refresh token이 없습니다.' })
      return
    }
    const result = await authService.refreshAccessToken(token)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    await authService.logout(token)
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
    res.json({ message: '로그아웃되었습니다.' })
  } catch (err) {
    next(err)
  }
})

export const usersRouter = Router()

usersRouter.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/me/likes', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const likes = await engagementService.listMyLikes(req.user!.id)
    res.json(likes)
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/me/comments', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const comments = await engagementService.listMyComments(req.user!.id)
    res.json(comments)
  } catch (err) {
    next(err)
  }
})
