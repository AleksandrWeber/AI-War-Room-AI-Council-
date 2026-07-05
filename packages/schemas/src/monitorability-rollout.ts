import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const monitorabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MonitorabilityRolloutCheckStatus = z.infer<
  typeof monitorabilityRolloutCheckStatusSchema
>

export const monitorabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: monitorabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MonitorabilityRolloutCheck = z.infer<typeof monitorabilityRolloutCheckSchema>

export const monitorabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MonitorabilityRolloutStatus = z.infer<typeof monitorabilityRolloutStatusSchema>

export const monitorabilityCapabilitiesResponseSchema = z.object({
  supportsMonitorabilityRollout: z.literal(true),
  supportsMonitorabilityAdminTools: z.literal(true),
  supportsUsageEventMonitorabilitySignals: z.literal(true),
  supportsBillingRecordMonitorabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MonitorabilityCapabilitiesResponse = z.infer<
  typeof monitorabilityCapabilitiesResponseSchema
>

export const monitorabilityRolloutResponseSchema = z.object({
  status: monitorabilityRolloutStatusSchema,
  checks: z.array(monitorabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MonitorabilityRolloutResponse = z.infer<
  typeof monitorabilityRolloutResponseSchema
>

export function getMonitorabilityRolloutGuidance() {
  return 'Production monitorability rollout validates usage event monitorability, billing record monitorability signals, shield scan coverage, and monitoring readiness before production monitorability tooling.'
}
