import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const narratabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NarratabilityRolloutCheckStatus = z.infer<
  typeof narratabilityRolloutCheckStatusSchema
>

export const narratabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: narratabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NarratabilityRolloutCheck = z.infer<typeof narratabilityRolloutCheckSchema>

export const narratabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NarratabilityRolloutStatus = z.infer<typeof narratabilityRolloutStatusSchema>

export const narratabilityCapabilitiesResponseSchema = z.object({
  supportsNarratabilityRollout: z.literal(true),
  supportsNarratabilityAdminTools: z.literal(true),
  supportsMembershipNarratabilitySignals: z.literal(true),
  supportsUsageEventNarratabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NarratabilityCapabilitiesResponse = z.infer<
  typeof narratabilityCapabilitiesResponseSchema
>

export const narratabilityRolloutResponseSchema = z.object({
  status: narratabilityRolloutStatusSchema,
  checks: z.array(narratabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NarratabilityRolloutResponse = z.infer<
  typeof narratabilityRolloutResponseSchema
>

export function getNarratabilityRolloutGuidance() {
  return 'Production narratability rollout validates membership narratability, usage event narratability signals, billing notification coverage, and narration readiness before production narratability tooling.'
}
