import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const familiarityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FamiliarityRolloutCheckStatus = z.infer<
  typeof familiarityRolloutCheckStatusSchema
>

export const familiarityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: familiarityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FamiliarityRolloutCheck = z.infer<typeof familiarityRolloutCheckSchema>

export const familiarityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FamiliarityRolloutStatus = z.infer<typeof familiarityRolloutStatusSchema>

export const familiarityCapabilitiesResponseSchema = z.object({
  supportsFamiliarityRollout: z.literal(true),
  supportsFamiliarityAdminTools: z.literal(true),
  supportsMembershipFamiliaritySignals: z.literal(true),
  supportsUsageEventFamiliaritySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FamiliarityCapabilitiesResponse = z.infer<
  typeof familiarityCapabilitiesResponseSchema
>

export const familiarityRolloutResponseSchema = z.object({
  status: familiarityRolloutStatusSchema,
  checks: z.array(familiarityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FamiliarityRolloutResponse = z.infer<
  typeof familiarityRolloutResponseSchema
>

export function getFamiliarityRolloutGuidance() {
  return 'Production familiarity rollout validates membership familiarity, usage event familiarity signals, billing notification coverage, and familiarity readiness before production familiarity tooling.'
}
