import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const desirabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DesirabilityRolloutCheckStatus = z.infer<
  typeof desirabilityRolloutCheckStatusSchema
>

export const desirabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: desirabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DesirabilityRolloutCheck = z.infer<typeof desirabilityRolloutCheckSchema>

export const desirabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DesirabilityRolloutStatus = z.infer<typeof desirabilityRolloutStatusSchema>

export const desirabilityCapabilitiesResponseSchema = z.object({
  supportsDesirabilityRollout: z.literal(true),
  supportsDesirabilityAdminTools: z.literal(true),
  supportsUsageEventDesirabilitySignals: z.literal(true),
  supportsBillingNotificationDesirabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DesirabilityCapabilitiesResponse = z.infer<
  typeof desirabilityCapabilitiesResponseSchema
>

export const desirabilityRolloutResponseSchema = z.object({
  status: desirabilityRolloutStatusSchema,
  checks: z.array(desirabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DesirabilityRolloutResponse = z.infer<
  typeof desirabilityRolloutResponseSchema
>

export function getDesirabilityRolloutGuidance() {
  return 'Production desirability rollout validates usage event desirability, billing notification desirability signals, membership coverage, and desirability readiness before production desirability tooling.'
}
