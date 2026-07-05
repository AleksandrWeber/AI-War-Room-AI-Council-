import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const backpressureizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BackpressureizabilityRolloutCheckStatus = z.infer<
  typeof backpressureizabilityRolloutCheckStatusSchema
>

export const backpressureizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: backpressureizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BackpressureizabilityRolloutCheck = z.infer<typeof backpressureizabilityRolloutCheckSchema>

export const backpressureizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BackpressureizabilityRolloutStatus = z.infer<typeof backpressureizabilityRolloutStatusSchema>

export const backpressureizabilityCapabilitiesResponseSchema = z.object({
  supportsBackpressureizabilityRollout: z.literal(true),
  supportsBackpressureizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitBackpressureizabilitySignals: z.literal(true),
  supportsUsageEventBackpressureizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BackpressureizabilityCapabilitiesResponse = z.infer<
  typeof backpressureizabilityCapabilitiesResponseSchema
>

export const backpressureizabilityRolloutResponseSchema = z.object({
  status: backpressureizabilityRolloutStatusSchema,
  checks: z.array(backpressureizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BackpressureizabilityRolloutResponse = z.infer<
  typeof backpressureizabilityRolloutResponseSchema
>

export function getBackpressureizabilityRolloutGuidance() {
  return 'Production backpressureizability rollout validates workspace limit backpressureizability, usage event backpressureizability signals, billing record coverage, and backpressureization readiness before production backpressureizability tooling.'
}
