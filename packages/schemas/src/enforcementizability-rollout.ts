import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const enforcementizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EnforcementizabilityRolloutCheckStatus = z.infer<
  typeof enforcementizabilityRolloutCheckStatusSchema
>

export const enforcementizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: enforcementizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EnforcementizabilityRolloutCheck = z.infer<typeof enforcementizabilityRolloutCheckSchema>

export const enforcementizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EnforcementizabilityRolloutStatus = z.infer<typeof enforcementizabilityRolloutStatusSchema>

export const enforcementizabilityCapabilitiesResponseSchema = z.object({
  supportsEnforcementizabilityRollout: z.literal(true),
  supportsEnforcementizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyEnforcementizabilitySignals: z.literal(true),
  supportsUsageEventEnforcementizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EnforcementizabilityCapabilitiesResponse = z.infer<
  typeof enforcementizabilityCapabilitiesResponseSchema
>

export const enforcementizabilityRolloutResponseSchema = z.object({
  status: enforcementizabilityRolloutStatusSchema,
  checks: z.array(enforcementizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EnforcementizabilityRolloutResponse = z.infer<
  typeof enforcementizabilityRolloutResponseSchema
>

export function getEnforcementizabilityRolloutGuidance() {
  return 'Production enforcementizability rollout validates idempotency key enforcementizability, usage event enforcementizability signals, billing webhook coverage, and remediationization readiness before production enforcementizability tooling.'
}
