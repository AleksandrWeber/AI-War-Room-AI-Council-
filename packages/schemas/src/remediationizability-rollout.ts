import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const remediationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RemediationizabilityRolloutCheckStatus = z.infer<
  typeof remediationizabilityRolloutCheckStatusSchema
>

export const remediationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: remediationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RemediationizabilityRolloutCheck = z.infer<typeof remediationizabilityRolloutCheckSchema>

export const remediationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RemediationizabilityRolloutStatus = z.infer<typeof remediationizabilityRolloutStatusSchema>

export const remediationizabilityCapabilitiesResponseSchema = z.object({
  supportsRemediationizabilityRollout: z.literal(true),
  supportsRemediationizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyRemediationizabilitySignals: z.literal(true),
  supportsUsageEventRemediationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RemediationizabilityCapabilitiesResponse = z.infer<
  typeof remediationizabilityCapabilitiesResponseSchema
>

export const remediationizabilityRolloutResponseSchema = z.object({
  status: remediationizabilityRolloutStatusSchema,
  checks: z.array(remediationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RemediationizabilityRolloutResponse = z.infer<
  typeof remediationizabilityRolloutResponseSchema
>

export function getRemediationizabilityRolloutGuidance() {
  return 'Production remediationizability rollout validates idempotency key remediationizability, usage event remediationizability signals, billing webhook coverage, and remediationization readiness before production remediationizability tooling.'
}
