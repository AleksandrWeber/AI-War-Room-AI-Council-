import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const demonstrabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DemonstrabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof demonstrabilityvaultizabilityRolloutCheckStatusSchema
>

export const demonstrabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: demonstrabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DemonstrabilityvaultizabilityRolloutCheck = z.infer<typeof demonstrabilityvaultizabilityRolloutCheckSchema>

export const demonstrabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DemonstrabilityvaultizabilityRolloutStatus = z.infer<typeof demonstrabilityvaultizabilityRolloutStatusSchema>

export const demonstrabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsDemonstrabilityvaultizabilityRollout: z.literal(true),
  supportsDemonstrabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyDemonstrabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventDemonstrabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DemonstrabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof demonstrabilityvaultizabilityCapabilitiesResponseSchema
>

export const demonstrabilityvaultizabilityRolloutResponseSchema = z.object({
  status: demonstrabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(demonstrabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DemonstrabilityvaultizabilityRolloutResponse = z.infer<
  typeof demonstrabilityvaultizabilityRolloutResponseSchema
>

export function getDemonstrabilityvaultizabilityRolloutGuidance() {
  return 'Production demonstrabilityvaultizability rollout validates idempotency key demonstrabilityvaultizability, usage event demonstrabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production demonstrabilityvaultizability tooling.'
}
