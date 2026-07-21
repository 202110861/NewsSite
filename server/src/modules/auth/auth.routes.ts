import { Router } from 'express'
import { env } from '../../config/env.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { authMiddleware, type AuthRequest } from '../../middlewares/auth.middleware.js'
import * as authService from './auth.service.js'
import * as oauthService from './oauth.service.js'
import * as engagementService from '../engagement/engagement.service.js'
import { checkUsernameSchema, loginSchema, signupSchema } from './auth.validation.js'

const REFRESH_COOKIE = 'refreshToken'
const OAUTH_STATE_COOKIE = oauthService.OAUTH_STATE_COOKIE

function getAuthCookiePolicy() {
  const secure =
    env.NODE_ENV === 'production' || new URL(env.CLIENT_URL).protocol === 'https:'
  return {
    secure,
    sameSite: secure ? ('none' as const) : ('lax' as const),
  }
}

function setRefreshCookie(res: import('express').Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    ...getAuthCookiePolicy(),
    maxAge: 14 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  })
}

function setOAuthStateCookie(res: import('express').Response, state: string) {
  res.cookie(OAUTH_STATE_COOKIE, oauthService.hashState(state), {
    httpOnly: true,
    ...getAuthCookiePolicy(),
    maxAge: 10 * 60 * 1000,
    path: '/api/auth',
  })
}

function clearOAuthStateCookie(res: import('express').Response) {
  res.clearCookie(OAUTH_STATE_COOKIE, { path: '/api/auth' })
}

function assertOAuthState(req: import('express').Request, state: string | undefined) {
  const stored = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined
  if (!state || !stored || stored !== oauthService.hashState(state)) {
    throw new AppError(400, '유효하지 않은 OAuth state입니다.')
  }
}

function redirectOAuthError(res: import('express').Response, message: string) {
  const url = new URL('/login', env.CLIENT_URL)
  url.searchParams.set('error', message)
  res.redirect(url.toString())
}

function finishOAuthLogin(
  res: import('express').Response,
  result: { refreshToken: string },
) {
  clearOAuthStateCookie(res)
  setRefreshCookie(res, result.refreshToken)
  res.redirect(new URL('/auth/callback', env.CLIENT_URL).toString())
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

authRouter.get('/kakao', (_req, res, next) => {
  try {
    const state = oauthService.createOAuthState()
    setOAuthStateCookie(res, state)
    res.redirect(oauthService.getKakaoAuthorizeUrl(state))
  } catch (err) {
    next(err)
  }
})

authRouter.get('/kakao/callback', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    const state = typeof req.query.state === 'string' ? req.query.state : undefined
    if (!code) throw new AppError(400, '카카오 인증 코드가 없습니다.')
    assertOAuthState(req, state)
    const result = await oauthService.completeKakaoLogin(code)
    finishOAuthLogin(res, result)
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : '카카오 로그인에 실패했습니다.'
    redirectOAuthError(res, message)
  }
})

authRouter.get('/naver', (_req, res, next) => {
  try {
    const state = oauthService.createOAuthState()
    setOAuthStateCookie(res, state)
    res.redirect(oauthService.getNaverAuthorizeUrl(state))
  } catch (err) {
    next(err)
  }
})

authRouter.get('/naver/callback', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    const state = typeof req.query.state === 'string' ? req.query.state : undefined
    if (!code) throw new AppError(400, '네이버 인증 코드가 없습니다.')
    assertOAuthState(req, state)
    const result = await oauthService.completeNaverLogin(code)
    finishOAuthLogin(res, result)
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : '네이버 로그인에 실패했습니다.'
    redirectOAuthError(res, message)
  }
})

authRouter.get('/google', (_req, res, next) => {
  try {
    const state = oauthService.createOAuthState()
    setOAuthStateCookie(res, state)
    res.redirect(oauthService.getGoogleAuthorizeUrl(state))
  } catch (err) {
    next(err)
  }
})

authRouter.get('/google/callback', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    const state = typeof req.query.state === 'string' ? req.query.state : undefined
    if (!code) throw new AppError(400, '구글 인증 코드가 없습니다.')
    assertOAuthState(req, state)
    const result = await oauthService.completeGoogleLogin(code)
    finishOAuthLogin(res, result)
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : '구글 로그인에 실패했습니다.'
    redirectOAuthError(res, message)
  }
})

authRouter.get('/facebook', (_req, res, next) => {
  try {
    const state = oauthService.createOAuthState()
    setOAuthStateCookie(res, state)
    res.redirect(oauthService.getFacebookAuthorizeUrl(state))
  } catch (err) {
    next(err)
  }
})

authRouter.get('/facebook/callback', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    const state = typeof req.query.state === 'string' ? req.query.state : undefined
    if (!code) throw new AppError(400, '페이스북 인증 코드가 없습니다.')
    assertOAuthState(req, state)
    const result = await oauthService.completeFacebookLogin(code)
    finishOAuthLogin(res, result)
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : '페이스북 로그인에 실패했습니다.'
    redirectOAuthError(res, message)
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
