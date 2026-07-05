import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const rebalanceizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RebalanceizabilityRolloutCheckStatus = z.infer<
  typeof rebalanceizabilityRolloutCheckStatusSchema
>

export const rebalanceizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: rebalanceizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RebalanceizabilityRolloutCheck = z.infer<typeof rebalanceizabilityRolloutCheckSchema>

export const rebalanceizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RebalanceizabilityRolloutStatus = z.infer<typeof rebalanceizabilityRolloutStatusSchema>

export const rebalanceizabilityCapabilitiesResponseSchema = z.object({
  supportsRebalanceizabilityRollout: z.literal(true),
  supportsRebalanceizabilityAdminTools: z.literal(true),
  supportsMeterUsageRebalanceizabilitySignals: z.literal(true),
  supportsUsageEventRebalanceizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RebalanceizabilityCapabilitiesResponse = z.infer<
  typeof rebalanceizabilityCapabilitiesResponseSchema
>

export const rebalanceizabilityRolloutResponseSchema = z.object({
  status: rebalanceizabilityRolloutStatusSchema,
  checks: z.array(rebalanceizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RebalanceizabilityRolloutResponse = z.infer<
  typeof rebalanceizabilityRolloutResponseSchema
>

export function getRebalanceizabilityRolloutGuidance() {
  return 'Production rebalanceizability rollout validates meter usage rebalanceizability, usage event rebalanceizability signals, workspace limit coverage, and rebalanceization readiness before production rebalanceizability tooling.'
}
