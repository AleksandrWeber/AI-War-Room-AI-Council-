import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const methodizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MethodizabilityRolloutCheckStatus = z.infer<
  typeof methodizabilityRolloutCheckStatusSchema
>

export const methodizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: methodizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MethodizabilityRolloutCheck = z.infer<typeof methodizabilityRolloutCheckSchema>

export const methodizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MethodizabilityRolloutStatus = z.infer<typeof methodizabilityRolloutStatusSchema>

export const methodizabilityCapabilitiesResponseSchema = z.object({
  supportsMethodizabilityRollout: z.literal(true),
  supportsMethodizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitMethodizabilitySignals: z.literal(true),
  supportsUsageEventMethodizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MethodizabilityCapabilitiesResponse = z.infer<
  typeof methodizabilityCapabilitiesResponseSchema
>

export const methodizabilityRolloutResponseSchema = z.object({
  status: methodizabilityRolloutStatusSchema,
  checks: z.array(methodizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MethodizabilityRolloutResponse = z.infer<
  typeof methodizabilityRolloutResponseSchema
>

export function getMethodizabilityRolloutGuidance() {
  return 'Production methodizability rollout validates workspace limit methodizability, usage event methodizability signals, billing record coverage, and methodization readiness before production methodizability tooling.'
}
