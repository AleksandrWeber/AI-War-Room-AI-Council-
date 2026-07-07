import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const forensicizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ForensicizabilityRolloutCheckStatus = z.infer<
  typeof forensicizabilityRolloutCheckStatusSchema
>

export const forensicizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: forensicizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ForensicizabilityRolloutCheck = z.infer<typeof forensicizabilityRolloutCheckSchema>

export const forensicizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ForensicizabilityRolloutStatus = z.infer<typeof forensicizabilityRolloutStatusSchema>

export const forensicizabilityCapabilitiesResponseSchema = z.object({
  supportsForensicizabilityRollout: z.literal(true),
  supportsForensicizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyForensicizabilitySignals: z.literal(true),
  supportsUsageEventForensicizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ForensicizabilityCapabilitiesResponse = z.infer<
  typeof forensicizabilityCapabilitiesResponseSchema
>

export const forensicizabilityRolloutResponseSchema = z.object({
  status: forensicizabilityRolloutStatusSchema,
  checks: z.array(forensicizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ForensicizabilityRolloutResponse = z.infer<
  typeof forensicizabilityRolloutResponseSchema
>

export function getForensicizabilityRolloutGuidance() {
  return 'Production forensicizability rollout validates idempotency key forensicizability, usage event forensicizability signals, billing webhook coverage, and remediationization readiness before production forensicizability tooling.'
}
