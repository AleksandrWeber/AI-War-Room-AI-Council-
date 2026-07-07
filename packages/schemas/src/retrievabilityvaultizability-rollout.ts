import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const retrievabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RetrievabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof retrievabilityvaultizabilityRolloutCheckStatusSchema
>

export const retrievabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: retrievabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RetrievabilityvaultizabilityRolloutCheck = z.infer<typeof retrievabilityvaultizabilityRolloutCheckSchema>

export const retrievabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RetrievabilityvaultizabilityRolloutStatus = z.infer<typeof retrievabilityvaultizabilityRolloutStatusSchema>

export const retrievabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsRetrievabilityvaultizabilityRollout: z.literal(true),
  supportsRetrievabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyRetrievabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventRetrievabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RetrievabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof retrievabilityvaultizabilityCapabilitiesResponseSchema
>

export const retrievabilityvaultizabilityRolloutResponseSchema = z.object({
  status: retrievabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(retrievabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RetrievabilityvaultizabilityRolloutResponse = z.infer<
  typeof retrievabilityvaultizabilityRolloutResponseSchema
>

export function getRetrievabilityvaultizabilityRolloutGuidance() {
  return 'Production retrievabilityvaultizability rollout validates idempotency key retrievabilityvaultizability, usage event retrievabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production retrievabilityvaultizability tooling.'
}
