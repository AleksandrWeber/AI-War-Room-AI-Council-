import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const schedulabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SchedulabilityRolloutCheckStatus = z.infer<
  typeof schedulabilityRolloutCheckStatusSchema
>

export const schedulabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: schedulabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SchedulabilityRolloutCheck = z.infer<typeof schedulabilityRolloutCheckSchema>

export const schedulabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SchedulabilityRolloutStatus = z.infer<typeof schedulabilityRolloutStatusSchema>

export const schedulabilityCapabilitiesResponseSchema = z.object({
  supportsSchedulabilityRollout: z.literal(true),
  supportsSchedulabilityAdminTools: z.literal(true),
  supportsMeterUsageSchedulabilitySignals: z.literal(true),
  supportsUsageEventSchedulabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SchedulabilityCapabilitiesResponse = z.infer<
  typeof schedulabilityCapabilitiesResponseSchema
>

export const schedulabilityRolloutResponseSchema = z.object({
  status: schedulabilityRolloutStatusSchema,
  checks: z.array(schedulabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SchedulabilityRolloutResponse = z.infer<
  typeof schedulabilityRolloutResponseSchema
>

export function getSchedulabilityRolloutGuidance() {
  return 'Production schedulability rollout validates meter usage schedulability, usage event schedulability signals, workspace limit coverage, and scheduling readiness before production schedulability tooling.'
}
