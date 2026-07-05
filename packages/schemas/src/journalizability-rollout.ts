import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const journalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type JournalizabilityRolloutCheckStatus = z.infer<
  typeof journalizabilityRolloutCheckStatusSchema
>

export const journalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: journalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type JournalizabilityRolloutCheck = z.infer<typeof journalizabilityRolloutCheckSchema>

export const journalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type JournalizabilityRolloutStatus = z.infer<typeof journalizabilityRolloutStatusSchema>

export const journalizabilityCapabilitiesResponseSchema = z.object({
  supportsJournalizabilityRollout: z.literal(true),
  supportsJournalizabilityAdminTools: z.literal(true),
  supportsMembershipJournalizabilitySignals: z.literal(true),
  supportsUsageEventJournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type JournalizabilityCapabilitiesResponse = z.infer<
  typeof journalizabilityCapabilitiesResponseSchema
>

export const journalizabilityRolloutResponseSchema = z.object({
  status: journalizabilityRolloutStatusSchema,
  checks: z.array(journalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type JournalizabilityRolloutResponse = z.infer<
  typeof journalizabilityRolloutResponseSchema
>

export function getJournalizabilityRolloutGuidance() {
  return 'Production journalizability rollout validates membership journalizability, usage event journalizability signals, billing notification coverage, and journalization readiness before production journalizability tooling.'
}
