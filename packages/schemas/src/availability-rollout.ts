import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const availabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AvailabilityRolloutCheckStatus = z.infer<
  typeof availabilityRolloutCheckStatusSchema
>

export const availabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: availabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AvailabilityRolloutCheck = z.infer<
  typeof availabilityRolloutCheckSchema
>

export const availabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AvailabilityRolloutStatus = z.infer<
  typeof availabilityRolloutStatusSchema
>

export const availabilityCapabilitiesResponseSchema = z.object({
  supportsAvailabilityRollout: z.literal(true),
  supportsAvailabilityAdminTools: z.literal(true),
  supportsRunOutcomeAvailabilitySignals: z.literal(true),
  supportsDependencyUptimeSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AvailabilityCapabilitiesResponse = z.infer<
  typeof availabilityCapabilitiesResponseSchema
>

export const availabilityRolloutResponseSchema = z.object({
  status: availabilityRolloutStatusSchema,
  checks: z.array(availabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AvailabilityRolloutResponse = z.infer<
  typeof availabilityRolloutResponseSchema
>

export function getAvailabilityRolloutGuidance() {
  return 'Production availability rollout validates workspace operational signals, API health endpoints, dependency uptime, and uptime readiness before production availability tooling.'
}
