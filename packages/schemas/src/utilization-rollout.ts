import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const utilizationRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type UtilizationRolloutCheckStatus = z.infer<
  typeof utilizationRolloutCheckStatusSchema
>

export const utilizationRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: utilizationRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type UtilizationRolloutCheck = z.infer<
  typeof utilizationRolloutCheckSchema
>

export const utilizationRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type UtilizationRolloutStatus = z.infer<
  typeof utilizationRolloutStatusSchema
>

export const utilizationCapabilitiesResponseSchema = z.object({
  supportsUtilizationRollout: z.literal(true),
  supportsUtilizationAdminTools: z.literal(true),
  supportsUsageConsumptionUtilizationSignals: z.literal(true),
  supportsMembershipUtilizationSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type UtilizationCapabilitiesResponse = z.infer<
  typeof utilizationCapabilitiesResponseSchema
>

export const utilizationRolloutResponseSchema = z.object({
  status: utilizationRolloutStatusSchema,
  checks: z.array(utilizationRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type UtilizationRolloutResponse = z.infer<
  typeof utilizationRolloutResponseSchema
>

export function getUtilizationRolloutGuidance() {
  return 'Production utilization rollout validates usage consumption utilization, membership utilization signals, run load coverage, and capacity readiness before production utilization tooling.'
}
