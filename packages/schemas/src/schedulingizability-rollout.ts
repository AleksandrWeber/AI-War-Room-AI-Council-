import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const schedulingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SchedulingizabilityRolloutCheckStatus = z.infer<
  typeof schedulingizabilityRolloutCheckStatusSchema
>

export const schedulingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: schedulingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SchedulingizabilityRolloutCheck = z.infer<typeof schedulingizabilityRolloutCheckSchema>

export const schedulingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SchedulingizabilityRolloutStatus = z.infer<typeof schedulingizabilityRolloutStatusSchema>

export const schedulingizabilityCapabilitiesResponseSchema = z.object({
  supportsSchedulingizabilityRollout: z.literal(true),
  supportsSchedulingizabilityAdminTools: z.literal(true),
  supportsMeterUsageSchedulingizabilitySignals: z.literal(true),
  supportsUsageEventSchedulingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SchedulingizabilityCapabilitiesResponse = z.infer<
  typeof schedulingizabilityCapabilitiesResponseSchema
>

export const schedulingizabilityRolloutResponseSchema = z.object({
  status: schedulingizabilityRolloutStatusSchema,
  checks: z.array(schedulingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SchedulingizabilityRolloutResponse = z.infer<
  typeof schedulingizabilityRolloutResponseSchema
>

export function getSchedulingizabilityRolloutGuidance() {
  return 'Production schedulingizability rollout validates meter usage schedulingizability, usage event schedulingizability signals, workspace limit coverage, and schedulingization readiness before production schedulingizability tooling.'
}
