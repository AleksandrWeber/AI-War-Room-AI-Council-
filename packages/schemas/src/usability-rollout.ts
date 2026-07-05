import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const usabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type UsabilityRolloutCheckStatus = z.infer<
  typeof usabilityRolloutCheckStatusSchema
>

export const usabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: usabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type UsabilityRolloutCheck = z.infer<typeof usabilityRolloutCheckSchema>

export const usabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type UsabilityRolloutStatus = z.infer<typeof usabilityRolloutStatusSchema>

export const usabilityCapabilitiesResponseSchema = z.object({
  supportsUsabilityRollout: z.literal(true),
  supportsUsabilityAdminTools: z.literal(true),
  supportsMembershipUsabilitySignals: z.literal(true),
  supportsUsageEventUsabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type UsabilityCapabilitiesResponse = z.infer<
  typeof usabilityCapabilitiesResponseSchema
>

export const usabilityRolloutResponseSchema = z.object({
  status: usabilityRolloutStatusSchema,
  checks: z.array(usabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type UsabilityRolloutResponse = z.infer<
  typeof usabilityRolloutResponseSchema
>

export function getUsabilityRolloutGuidance() {
  return 'Production usability rollout validates membership usability, usage event usability signals, billing notification coverage, and usage readiness before production usability tooling.'
}
