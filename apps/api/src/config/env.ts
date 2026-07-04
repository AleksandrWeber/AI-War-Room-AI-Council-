import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  WEB_ORIGIN: z.url().default('http://127.0.0.1:5173'),
})

export type ApiEnv = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): ApiEnv {
  return envSchema.parse(config)
}
