import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const lineageizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LineageizabilityRolloutCheckStatus = z.infer<
  typeof lineageizabilityRolloutCheckStatusSchema
>

export const lineageizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: lineageizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LineageizabilityRolloutCheck = z.infer<typeof lineageizabilityRolloutCheckSchema>

export const lineageizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LineageizabilityRolloutStatus = z.infer<typeof lineageizabilityRolloutStatusSchema>

export const lineageizabilityCapabilitiesResponseSchema = z.object({
  supportsLineageizabilityRollout: z.literal(true),
  supportsLineageizabilityAdminTools: z.literal(true),
  supportsMembershipLineageizabilitySignals: z.literal(true),
  supportsUsageEventLineageizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LineageizabilityCapabilitiesResponse = z.infer<
  typeof lineageizabilityCapabilitiesResponseSchema
>

export const lineageizabilityRolloutResponseSchema = z.object({
  status: lineageizabilityRolloutStatusSchema,
  checks: z.array(lineageizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LineageizabilityRolloutResponse = z.infer<
  typeof lineageizabilityRolloutResponseSchema
>

export function getLineageizabilityRolloutGuidance() {
  return 'Production lineageizability rollout validates membership lineageizability, usage event lineageizability signals, billing notification coverage, and healingization readiness before production lineageizability tooling.'
}
