import { z } from 'zod'

const optionalEnvStringSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
)

const booleanEnvSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}, z.boolean())

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  WEB_ORIGIN: z.url().default('http://127.0.0.1:5173'),
  DATABASE_URL: z
    .url()
    .default('postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room'),
  REDIS_URL: z.url().default('redis://127.0.0.1:6379'),
  APP_ENCRYPTION_KEY: z
    .string()
    .trim()
    .min(16)
    .default('local-development-encryption-key-change-me'),
  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),
  LLM_PRIMARY_PROVIDER: z.enum(['mock', 'anthropic', 'openai']).default('mock'),
  LLM_FALLBACK_PROVIDER: z.enum(['mock', 'anthropic', 'openai']).default('mock'),
  LLM_PRIMARY_MODEL: z.string().trim().min(1).default('mock-json-v1'),
  LLM_FALLBACK_MODEL: z.string().trim().min(1).default('mock-json-v1'),
  LLM_MAX_ATTEMPTS: z.coerce.number().int().positive().max(5).default(3),
  LLM_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  ANTHROPIC_API_KEY: optionalEnvStringSchema,
  ANTHROPIC_API_URL: z.url().default('https://api.anthropic.com/v1/messages'),
  OPENAI_API_KEY: optionalEnvStringSchema,
  OPENAI_API_URL: z
    .url()
    .default('https://api.openai.com/v1/chat/completions'),
  RESEARCH_PROVIDER: z.enum(['mock', 'tavily']).default('mock'),
  TAVILY_API_KEY: optionalEnvStringSchema,
  TAVILY_API_URL: z.url().default('https://api.tavily.com/search'),
  TAVILY_MAX_RESULTS: z.coerce.number().int().positive().max(10).default(5),
  TEMPORAL_ENABLED: booleanEnvSchema.default(false),
  TEMPORAL_ADDRESS: z.string().trim().min(1).default('127.0.0.1:7233'),
  TEMPORAL_NAMESPACE: z.string().trim().min(1).default('default'),
  TEMPORAL_TASK_QUEUE: z.string().trim().min(1).default('ai-war-room-runs'),
  TEMPORAL_WORKFLOW_STREAM_POLL_MS: z.coerce.number().int().positive().default(1_000),
  TEMPORAL_WORKFLOW_STREAM_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(300_000),
})

export type ApiEnv = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): ApiEnv {
  return envSchema.parse(config)
}
