import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const loadbalancizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LoadbalancizabilityRolloutCheckStatus = z.infer<
  typeof loadbalancizabilityRolloutCheckStatusSchema
>

export const loadbalancizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: loadbalancizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LoadbalancizabilityRolloutCheck = z.infer<typeof loadbalancizabilityRolloutCheckSchema>

export const loadbalancizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LoadbalancizabilityRolloutStatus = z.infer<typeof loadbalancizabilityRolloutStatusSchema>

export const loadbalancizabilityCapabilitiesResponseSchema = z.object({
  supportsLoadbalancizabilityRollout: z.literal(true),
  supportsLoadbalancizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitLoadbalancizabilitySignals: z.literal(true),
  supportsUsageEventLoadbalancizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LoadbalancizabilityCapabilitiesResponse = z.infer<
  typeof loadbalancizabilityCapabilitiesResponseSchema
>

export const loadbalancizabilityRolloutResponseSchema = z.object({
  status: loadbalancizabilityRolloutStatusSchema,
  checks: z.array(loadbalancizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LoadbalancizabilityRolloutResponse = z.infer<
  typeof loadbalancizabilityRolloutResponseSchema
>

export function getLoadbalancizabilityRolloutGuidance() {
  return 'Production loadbalancizability rollout validates workspace limit loadbalancizability, usage event loadbalancizability signals, billing record coverage, and loadbalancization readiness before production loadbalancizability tooling.'
}
