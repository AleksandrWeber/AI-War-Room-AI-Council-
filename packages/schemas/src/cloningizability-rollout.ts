import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const cloningizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CloningizabilityRolloutCheckStatus = z.infer<
  typeof cloningizabilityRolloutCheckStatusSchema
>

export const cloningizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: cloningizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CloningizabilityRolloutCheck = z.infer<typeof cloningizabilityRolloutCheckSchema>

export const cloningizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CloningizabilityRolloutStatus = z.infer<typeof cloningizabilityRolloutStatusSchema>

export const cloningizabilityCapabilitiesResponseSchema = z.object({
  supportsCloningizabilityRollout: z.literal(true),
  supportsCloningizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitCloningizabilitySignals: z.literal(true),
  supportsUsageEventCloningizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CloningizabilityCapabilitiesResponse = z.infer<
  typeof cloningizabilityCapabilitiesResponseSchema
>

export const cloningizabilityRolloutResponseSchema = z.object({
  status: cloningizabilityRolloutStatusSchema,
  checks: z.array(cloningizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CloningizabilityRolloutResponse = z.infer<
  typeof cloningizabilityRolloutResponseSchema
>

export function getCloningizabilityRolloutGuidance() {
  return 'Production cloningizability rollout validates workspace limit cloningizability, usage event cloningizability signals, billing record coverage, and cloningization readiness before production cloningizability tooling.'
}
