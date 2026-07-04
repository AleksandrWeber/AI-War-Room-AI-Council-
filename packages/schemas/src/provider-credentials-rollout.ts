import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const providerCredentialsRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type ProviderCredentialsRolloutCheckStatus = z.infer<
  typeof providerCredentialsRolloutCheckStatusSchema
>

export const providerCredentialsRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: providerCredentialsRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProviderCredentialsRolloutCheck = z.infer<
  typeof providerCredentialsRolloutCheckSchema
>

export const providerCredentialsRolloutStatusSchema = z.enum([
  'ready',
  'not_ready',
])
export type ProviderCredentialsRolloutStatus = z.infer<
  typeof providerCredentialsRolloutStatusSchema
>

export const providerCredentialsCapabilitiesResponseSchema = z.object({
  supportsProviderCredentialsRollout: z.literal(true),
  supportsProviderKeyAdminTools: z.literal(true),
  managedProviders: z.array(z.enum(['anthropic', 'openai'])).min(1),
  guidance: nonEmptyStringSchema,
})
export type ProviderCredentialsCapabilitiesResponse = z.infer<
  typeof providerCredentialsCapabilitiesResponseSchema
>

export const providerCredentialsRolloutResponseSchema = z.object({
  status: providerCredentialsRolloutStatusSchema,
  checks: z.array(providerCredentialsRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProviderCredentialsRolloutResponse = z.infer<
  typeof providerCredentialsRolloutResponseSchema
>

export const DEFAULT_APP_ENCRYPTION_KEY =
  'local-development-encryption-key-change-me'

export function getProviderCredentialsRolloutGuidance() {
  return 'Provider credentials rollout validates encryption, persistence, and managed provider support before enabling workspace BYOK in production.'
}
