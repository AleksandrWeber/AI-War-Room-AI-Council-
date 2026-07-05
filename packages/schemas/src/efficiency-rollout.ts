import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const efficiencyRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EfficiencyRolloutCheckStatus = z.infer<
  typeof efficiencyRolloutCheckStatusSchema
>

export const efficiencyRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: efficiencyRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EfficiencyRolloutCheck = z.infer<typeof efficiencyRolloutCheckSchema>

export const efficiencyRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EfficiencyRolloutStatus = z.infer<
  typeof efficiencyRolloutStatusSchema
>

export const efficiencyCapabilitiesResponseSchema = z.object({
  supportsEfficiencyRollout: z.literal(true),
  supportsEfficiencyAdminTools: z.literal(true),
  supportsUsageTelemetryEfficiencySignals: z.literal(true),
  supportsCostLimitEfficiencySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EfficiencyCapabilitiesResponse = z.infer<
  typeof efficiencyCapabilitiesResponseSchema
>

export const efficiencyRolloutResponseSchema = z.object({
  status: efficiencyRolloutStatusSchema,
  checks: z.array(efficiencyRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EfficiencyRolloutResponse = z.infer<
  typeof efficiencyRolloutResponseSchema
>

export function getEfficiencyRolloutGuidance() {
  return 'Production efficiency rollout validates usage telemetry efficiency, cost limit coverage, run outcome signals, and resource readiness before production efficiency tooling.'
}
