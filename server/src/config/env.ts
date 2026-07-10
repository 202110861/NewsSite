import { config } from 'dotenv'
import { z } from 'zod'

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
})

export const env = envSchema.parse(process.env)
