import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const inspectabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InspectabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof inspectabilityvaultizabilityRolloutCheckStatusSchema
>

export const inspectabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: inspectabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InspectabilityvaultizabilityRolloutCheck = z.infer<typeof inspectabilityvaultizabilityRolloutCheckSchema>

export const inspectabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InspectabilityvaultizabilityRolloutStatus = z.infer<typeof inspectabilityvaultizabilityRolloutStatusSchema>

export const inspectabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsInspectabilityvaultizabilityRollout: z.literal(true),
  supportsInspectabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyInspectabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventInspectabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InspectabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof inspectabilityvaultizabilityCapabilitiesResponseSchema
>

export const inspectabilityvaultizabilityRolloutResponseSchema = z.object({
  status: inspectabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(inspectabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InspectabilityvaultizabilityRolloutResponse = z.infer<
  typeof inspectabilityvaultizabilityRolloutResponseSchema
>

export function getInspectabilityvaultizabilityRolloutGuidance() {
  return 'Production inspectabilityvaultizability rollout validates idempotency key inspectabilityvaultizability, usage event inspectabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production inspectabilityvaultizability tooling.'
}
