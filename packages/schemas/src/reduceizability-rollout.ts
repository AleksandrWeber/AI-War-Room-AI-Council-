import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reduceizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReduceizabilityRolloutCheckStatus = z.infer<
  typeof reduceizabilityRolloutCheckStatusSchema
>

export const reduceizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reduceizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReduceizabilityRolloutCheck = z.infer<typeof reduceizabilityRolloutCheckSchema>

export const reduceizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReduceizabilityRolloutStatus = z.infer<typeof reduceizabilityRolloutStatusSchema>

export const reduceizabilityCapabilitiesResponseSchema = z.object({
  supportsReduceizabilityRollout: z.literal(true),
  supportsReduceizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitReduceizabilitySignals: z.literal(true),
  supportsUsageEventReduceizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReduceizabilityCapabilitiesResponse = z.infer<
  typeof reduceizabilityCapabilitiesResponseSchema
>

export const reduceizabilityRolloutResponseSchema = z.object({
  status: reduceizabilityRolloutStatusSchema,
  checks: z.array(reduceizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReduceizabilityRolloutResponse = z.infer<
  typeof reduceizabilityRolloutResponseSchema
>

export function getReduceizabilityRolloutGuidance() {
  return 'Production reduceizability rollout validates workspace limit reduceizability, usage event reduceizability signals, billing record coverage, and reduceization readiness before production reduceizability tooling.'
}
