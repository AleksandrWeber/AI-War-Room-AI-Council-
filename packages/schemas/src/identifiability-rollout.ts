import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const identifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IdentifiabilityRolloutCheckStatus = z.infer<
  typeof identifiabilityRolloutCheckStatusSchema
>

export const identifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: identifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IdentifiabilityRolloutCheck = z.infer<typeof identifiabilityRolloutCheckSchema>

export const identifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IdentifiabilityRolloutStatus = z.infer<typeof identifiabilityRolloutStatusSchema>

export const identifiabilityCapabilitiesResponseSchema = z.object({
  supportsIdentifiabilityRollout: z.literal(true),
  supportsIdentifiabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyIdentifiabilitySignals: z.literal(true),
  supportsProviderCredentialIdentifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IdentifiabilityCapabilitiesResponse = z.infer<
  typeof identifiabilityCapabilitiesResponseSchema
>

export const identifiabilityRolloutResponseSchema = z.object({
  status: identifiabilityRolloutStatusSchema,
  checks: z.array(identifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IdentifiabilityRolloutResponse = z.infer<
  typeof identifiabilityRolloutResponseSchema
>

export function getIdentifiabilityRolloutGuidance() {
  return 'Production identifiability rollout validates idempotency key identifiability, provider credential identifiability signals, usage event coverage, and identity readiness before production identifiability tooling.'
}
