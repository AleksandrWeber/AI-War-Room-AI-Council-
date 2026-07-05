import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const canaryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CanaryizabilityRolloutCheckStatus = z.infer<
  typeof canaryizabilityRolloutCheckStatusSchema
>

export const canaryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: canaryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CanaryizabilityRolloutCheck = z.infer<typeof canaryizabilityRolloutCheckSchema>

export const canaryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CanaryizabilityRolloutStatus = z.infer<typeof canaryizabilityRolloutStatusSchema>

export const canaryizabilityCapabilitiesResponseSchema = z.object({
  supportsCanaryizabilityRollout: z.literal(true),
  supportsCanaryizabilityAdminTools: z.literal(true),
  supportsMeterUsageCanaryizabilitySignals: z.literal(true),
  supportsUsageEventCanaryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CanaryizabilityCapabilitiesResponse = z.infer<
  typeof canaryizabilityCapabilitiesResponseSchema
>

export const canaryizabilityRolloutResponseSchema = z.object({
  status: canaryizabilityRolloutStatusSchema,
  checks: z.array(canaryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CanaryizabilityRolloutResponse = z.infer<
  typeof canaryizabilityRolloutResponseSchema
>

export function getCanaryizabilityRolloutGuidance() {
  return 'Production canaryizability rollout validates meter usage canaryizability, usage event canaryizability signals, workspace limit coverage, and canaryization readiness before production canaryizability tooling.'
}
