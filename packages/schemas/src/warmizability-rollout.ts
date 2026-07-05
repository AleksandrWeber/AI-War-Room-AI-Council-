import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const warmizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WarmizabilityRolloutCheckStatus = z.infer<
  typeof warmizabilityRolloutCheckStatusSchema
>

export const warmizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: warmizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WarmizabilityRolloutCheck = z.infer<typeof warmizabilityRolloutCheckSchema>

export const warmizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WarmizabilityRolloutStatus = z.infer<typeof warmizabilityRolloutStatusSchema>

export const warmizabilityCapabilitiesResponseSchema = z.object({
  supportsWarmizabilityRollout: z.literal(true),
  supportsWarmizabilityAdminTools: z.literal(true),
  supportsMeterUsageWarmizabilitySignals: z.literal(true),
  supportsUsageEventWarmizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WarmizabilityCapabilitiesResponse = z.infer<
  typeof warmizabilityCapabilitiesResponseSchema
>

export const warmizabilityRolloutResponseSchema = z.object({
  status: warmizabilityRolloutStatusSchema,
  checks: z.array(warmizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WarmizabilityRolloutResponse = z.infer<
  typeof warmizabilityRolloutResponseSchema
>

export function getWarmizabilityRolloutGuidance() {
  return 'Production warmizability rollout validates meter usage warmizability, usage event warmizability signals, workspace limit coverage, and warmization readiness before production warmizability tooling.'
}
