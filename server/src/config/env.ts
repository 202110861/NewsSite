import { config } from 'dotenv'
import { z } from 'zod'
import { AppError } from '../middlewares/errorHandler.middleware.js'

config()

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  AUTOMATION_API_KEY: z.string().min(8),
  CLIENT_URL: z.string().url(),
  API_PUBLIC_URL: z.string().url().optional(),
  FRONTEND_S3_BUCKET: z.string().min(1).optional(),
  AWS_REGION: z.string().default('ap-northeast-2'),
  CLOUDFRONT_DISTRIBUTION_ID: z.string().min(1).optional(),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NAVER_CLIENT_ID: z.string().optional(),
  NAVER_CLIENT_SECRET: z.string().optional(),
  NAVER_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_REDIRECT_URI: z.string().url().optional(),
  PORTONE_IMP_CODE: z.string().optional(),
  PORTONE_API_KEY: z.string().optional(),
  PORTONE_API_SECRET: z.string().optional(),
  PORTONE_CHANNEL_KEY: z.string().optional(),
  PORTONE_PG: z.string().default('danal'),
})

export const env = envSchema.parse(process.env)

export function requireNaverOAuth() {
  const { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_REDIRECT_URI } = env
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET || !NAVER_REDIRECT_URI) {
    throw new AppError(503, '네이버 로그인이 아직 설정되지 않았습니다.')
  }
  return {
    clientId: NAVER_CLIENT_ID,
    clientSecret: NAVER_CLIENT_SECRET,
    redirectUri: NAVER_REDIRECT_URI,
  }
}

export function requireGoogleOAuth() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new AppError(503, '구글 로그인이 아직 설정되지 않았습니다.')
  }
  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
  }
}

export function requireFacebookOAuth() {
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI } = env
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !FACEBOOK_REDIRECT_URI) {
    throw new AppError(503, '페이스북 로그인이 아직 설정되지 않았습니다.')
  }
  return {
    appId: FACEBOOK_APP_ID,
    appSecret: FACEBOOK_APP_SECRET,
    redirectUri: FACEBOOK_REDIRECT_URI,
  }
}

export function requirePortOne() {
  const {
    PORTONE_IMP_CODE,
    PORTONE_API_KEY,
    PORTONE_API_SECRET,
    PORTONE_CHANNEL_KEY,
    PORTONE_PG,
  } = env
  if (!PORTONE_IMP_CODE || !PORTONE_API_KEY || !PORTONE_API_SECRET) {
    throw new AppError(503, 'PortOne 결제가 아직 설정되지 않았습니다.')
  }
  return {
    impCode: PORTONE_IMP_CODE,
    apiKey: PORTONE_API_KEY,
    apiSecret: PORTONE_API_SECRET,
    channelKey: PORTONE_CHANNEL_KEY,
    pg: PORTONE_PG,
  }
}
