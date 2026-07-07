import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const comparabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComparabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof comparabilityvaultizabilityRolloutCheckStatusSchema
>

export const comparabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: comparabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComparabilityvaultizabilityRolloutCheck = z.infer<typeof comparabilityvaultizabilityRolloutCheckSchema>

export const comparabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComparabilityvaultizabilityRolloutStatus = z.infer<typeof comparabilityvaultizabilityRolloutStatusSchema>

export const comparabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsComparabilityvaultizabilityRollout: z.literal(true),
  supportsComparabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyComparabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventComparabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComparabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof comparabilityvaultizabilityCapabilitiesResponseSchema
>

export const comparabilityvaultizabilityRolloutResponseSchema = z.object({
  status: comparabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(comparabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComparabilityvaultizabilityRolloutResponse = z.infer<
  typeof comparabilityvaultizabilityRolloutResponseSchema
>

export function getComparabilityvaultizabilityRolloutGuidance() {
  return 'Production comparabilityvaultizability rollout validates idempotency key comparabilityvaultizability, usage event comparabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production comparabilityvaultizability tooling.'
}
