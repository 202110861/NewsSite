import { createHash, randomBytes } from 'node:crypto'
import type { AuthProvider } from '@prisma/client'
import { prisma } from '../../db/client.js'
import { requireGoogleOAuth, requireNaverOAuth } from '../../config/env.js'
import { AppError } from '../../middlewares/errorHandler.middleware.js'
import { getRefreshExpiry, signAccessToken, signRefreshToken } from '../../utils/jwt.js'

const OAUTH_STATE_COOKIE = 'oauth_state'

export { OAUTH_STATE_COOKIE }

function sanitizeUsernameBase(raw: string) {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
  return (cleaned || 'user').slice(0, 20)
}

async function uniqueUsername(base: string) {
  const root = sanitizeUsernameBase(base)
  for (let i = 0; i < 8; i += 1) {
    const candidate = i === 0 ? root : `${root}_${randomBytes(2).toString('hex')}`
    const existing = await prisma.user.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
  }
  return `${root}_${randomBytes(4).toString('hex')}`
}

async function issueSession(user: { id: string; username: string; role: 'USER' | 'ADMIN' }) {
  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  })
  const refreshToken = signRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshExpiry(),
    },
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, role: user.role },
  }
}

async function findOrCreateOAuthUser(input: {
  provider: AuthProvider
  providerUserId: string
  usernameHint: string
}) {
  const existing = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: input.provider,
        providerUserId: input.providerUserId,
      },
    },
    include: { user: true },
  })

  if (existing) {
    return issueSession(existing.user)
  }

  const username = await uniqueUsername(input.usernameHint)
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: null,
      oauthAccounts: {
        create: {
          provider: input.provider,
          providerUserId: input.providerUserId,
        },
      },
    },
  })

  return issueSession(user)
}

export function createOAuthState() {
  return randomBytes(24).toString('hex')
}

export function hashState(state: string) {
  return createHash('sha256').update(state).digest('hex')
}

export function getNaverAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = requireNaverOAuth()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  })
  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
}

export function getGoogleAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = requireGoogleOAuth()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function completeNaverLogin(code: string) {
  const { clientId, clientSecret, redirectUri } = requireNaverOAuth()

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  })

  const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`, {
    method: 'GET',
  })
  const tokenBody = (await tokenRes.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!tokenRes.ok || !tokenBody.access_token) {
    throw new AppError(
      401,
      tokenBody.error_description ?? '네이버 토큰 발급에 실패했습니다.',
    )
  }

  const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  })
  const profileBody = (await profileRes.json()) as {
    resultcode?: string
    message?: string
    response?: {
      id?: string
      nickname?: string
      email?: string
      name?: string
    }
  }

  if (!profileRes.ok || profileBody.resultcode !== '00' || !profileBody.response?.id) {
    throw new AppError(401, profileBody.message ?? '네이버 사용자 정보를 가져오지 못했습니다.')
  }

  const { id: providerUserId, nickname, name, email } = profileBody.response
  const usernameHint =
    nickname || name || email?.split('@')[0] || `naver_${providerUserId.slice(0, 8)}`

  return findOrCreateOAuthUser({
    provider: 'NAVER',
    providerUserId,
    usernameHint,
  })
}

export async function completeGoogleLogin(code: string) {
  const { clientId, clientSecret, redirectUri } = requireGoogleOAuth()

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokenBody = (await tokenRes.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!tokenRes.ok || !tokenBody.access_token) {
    throw new AppError(
      401,
      tokenBody.error_description ?? '구글 토큰 발급에 실패했습니다.',
    )
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  })
  const profile = (await profileRes.json()) as {
    id?: string
    email?: string
    name?: string
    error?: { message?: string }
  }

  if (!profileRes.ok || !profile.id) {
    throw new AppError(401, profile.error?.message ?? '구글 사용자 정보를 가져오지 못했습니다.')
  }

  const usernameHint =
    profile.email?.split('@')[0] || profile.name || `google_${profile.id.slice(0, 8)}`

  return findOrCreateOAuthUser({
    provider: 'GOOGLE',
    providerUserId: profile.id,
    usernameHint,
  })
}
