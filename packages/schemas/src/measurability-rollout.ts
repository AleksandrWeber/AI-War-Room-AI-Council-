import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const measurabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MeasurabilityRolloutCheckStatus = z.infer<
  typeof measurabilityRolloutCheckStatusSchema
>

export const measurabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: measurabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MeasurabilityRolloutCheck = z.infer<typeof measurabilityRolloutCheckSchema>

export const measurabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MeasurabilityRolloutStatus = z.infer<typeof measurabilityRolloutStatusSchema>

export const measurabilityCapabilitiesResponseSchema = z.object({
  supportsMeasurabilityRollout: z.literal(true),
  supportsMeasurabilityAdminTools: z.literal(true),
  supportsMeterUsageMeasurabilitySignals: z.literal(true),
  supportsUsageEventMeasurabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MeasurabilityCapabilitiesResponse = z.infer<
  typeof measurabilityCapabilitiesResponseSchema
>

export const measurabilityRolloutResponseSchema = z.object({
  status: measurabilityRolloutStatusSchema,
  checks: z.array(measurabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MeasurabilityRolloutResponse = z.infer<
  typeof measurabilityRolloutResponseSchema
>

export function getMeasurabilityRolloutGuidance() {
  return 'Production measurability rollout validates meter usage measurability, usage event measurability signals, workspace limit coverage, and measurement readiness before production measurability tooling.'
}
