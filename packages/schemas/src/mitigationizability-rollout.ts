import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const mitigationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MitigationizabilityRolloutCheckStatus = z.infer<
  typeof mitigationizabilityRolloutCheckStatusSchema
>

export const mitigationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: mitigationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MitigationizabilityRolloutCheck = z.infer<typeof mitigationizabilityRolloutCheckSchema>

export const mitigationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MitigationizabilityRolloutStatus = z.infer<typeof mitigationizabilityRolloutStatusSchema>

export const mitigationizabilityCapabilitiesResponseSchema = z.object({
  supportsMitigationizabilityRollout: z.literal(true),
  supportsMitigationizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyMitigationizabilitySignals: z.literal(true),
  supportsUsageEventMitigationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MitigationizabilityCapabilitiesResponse = z.infer<
  typeof mitigationizabilityCapabilitiesResponseSchema
>

export const mitigationizabilityRolloutResponseSchema = z.object({
  status: mitigationizabilityRolloutStatusSchema,
  checks: z.array(mitigationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MitigationizabilityRolloutResponse = z.infer<
  typeof mitigationizabilityRolloutResponseSchema
>

export function getMitigationizabilityRolloutGuidance() {
  return 'Production mitigationizability rollout validates idempotency key mitigationizability, usage event mitigationizability signals, billing webhook coverage, and remediationization readiness before production mitigationizability tooling.'
}
