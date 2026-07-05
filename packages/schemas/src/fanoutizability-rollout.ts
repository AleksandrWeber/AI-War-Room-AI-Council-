import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const fanoutizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FanoutizabilityRolloutCheckStatus = z.infer<
  typeof fanoutizabilityRolloutCheckStatusSchema
>

export const fanoutizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: fanoutizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FanoutizabilityRolloutCheck = z.infer<typeof fanoutizabilityRolloutCheckSchema>

export const fanoutizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FanoutizabilityRolloutStatus = z.infer<typeof fanoutizabilityRolloutStatusSchema>

export const fanoutizabilityCapabilitiesResponseSchema = z.object({
  supportsFanoutizabilityRollout: z.literal(true),
  supportsFanoutizabilityAdminTools: z.literal(true),
  supportsMeterUsageFanoutizabilitySignals: z.literal(true),
  supportsUsageEventFanoutizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FanoutizabilityCapabilitiesResponse = z.infer<
  typeof fanoutizabilityCapabilitiesResponseSchema
>

export const fanoutizabilityRolloutResponseSchema = z.object({
  status: fanoutizabilityRolloutStatusSchema,
  checks: z.array(fanoutizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FanoutizabilityRolloutResponse = z.infer<
  typeof fanoutizabilityRolloutResponseSchema
>

export function getFanoutizabilityRolloutGuidance() {
  return 'Production fanoutizability rollout validates meter usage fanoutizability, usage event fanoutizability signals, workspace limit coverage, and fanoutization readiness before production fanoutizability tooling.'
}
