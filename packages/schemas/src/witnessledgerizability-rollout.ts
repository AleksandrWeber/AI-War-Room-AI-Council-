import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const witnessledgerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WitnessledgerizabilityRolloutCheckStatus = z.infer<
  typeof witnessledgerizabilityRolloutCheckStatusSchema
>

export const witnessledgerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: witnessledgerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WitnessledgerizabilityRolloutCheck = z.infer<typeof witnessledgerizabilityRolloutCheckSchema>

export const witnessledgerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WitnessledgerizabilityRolloutStatus = z.infer<typeof witnessledgerizabilityRolloutStatusSchema>

export const witnessledgerizabilityCapabilitiesResponseSchema = z.object({
  supportsWitnessledgerizabilityRollout: z.literal(true),
  supportsWitnessledgerizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyWitnessledgerizabilitySignals: z.literal(true),
  supportsUsageEventWitnessledgerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WitnessledgerizabilityCapabilitiesResponse = z.infer<
  typeof witnessledgerizabilityCapabilitiesResponseSchema
>

export const witnessledgerizabilityRolloutResponseSchema = z.object({
  status: witnessledgerizabilityRolloutStatusSchema,
  checks: z.array(witnessledgerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WitnessledgerizabilityRolloutResponse = z.infer<
  typeof witnessledgerizabilityRolloutResponseSchema
>

export function getWitnessledgerizabilityRolloutGuidance() {
  return 'Production witnessledgerizability rollout validates idempotency key witnessledgerizability, usage event witnessledgerizability signals, billing webhook coverage, and remediationization readiness before production witnessledgerizability tooling.'
}
