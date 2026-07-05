import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const capacityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CapacityRolloutCheckStatus = z.infer<
  typeof capacityRolloutCheckStatusSchema
>

export const capacityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: capacityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CapacityRolloutCheck = z.infer<typeof capacityRolloutCheckSchema>

export const capacityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CapacityRolloutStatus = z.infer<typeof capacityRolloutStatusSchema>

export const capacityCapabilitiesResponseSchema = z.object({
  supportsCapacityRollout: z.literal(true),
  supportsCapacityAdminTools: z.literal(true),
  supportsUsageLimitsCapacitySignals: z.literal(true),
  supportsRedisCapacitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CapacityCapabilitiesResponse = z.infer<
  typeof capacityCapabilitiesResponseSchema
>

export const capacityRolloutResponseSchema = z.object({
  status: capacityRolloutStatusSchema,
  checks: z.array(capacityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CapacityRolloutResponse = z.infer<
  typeof capacityRolloutResponseSchema
>

export function getCapacityRolloutGuidance() {
  return 'Production capacity rollout validates usage limit signals, run load coverage, Redis-backed buffers, and scaling readiness before production capacity tooling.'
}
