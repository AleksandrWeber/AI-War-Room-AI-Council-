import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const sloRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SloRolloutCheckStatus = z.infer<typeof sloRolloutCheckStatusSchema>

export const sloRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: sloRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SloRolloutCheck = z.infer<typeof sloRolloutCheckSchema>

export const sloRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SloRolloutStatus = z.infer<typeof sloRolloutStatusSchema>

export const sloCapabilitiesResponseSchema = z.object({
  supportsSloRollout: z.literal(true),
  supportsSloAdminTools: z.literal(true),
  supportsUsageEventSloSignals: z.literal(true),
  supportsObservabilitySloBuffer: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SloCapabilitiesResponse = z.infer<
  typeof sloCapabilitiesResponseSchema
>

export const sloRolloutResponseSchema = z.object({
  status: sloRolloutStatusSchema,
  checks: z.array(sloRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SloRolloutResponse = z.infer<typeof sloRolloutResponseSchema>

export function getSloRolloutGuidance() {
  return 'Production SLO rollout validates usage event signals, run outcome coverage, observability buffers, and model health events before target-ready operations.'
}
