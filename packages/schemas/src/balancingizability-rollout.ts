import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const balancingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BalancingizabilityRolloutCheckStatus = z.infer<
  typeof balancingizabilityRolloutCheckStatusSchema
>

export const balancingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: balancingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BalancingizabilityRolloutCheck = z.infer<typeof balancingizabilityRolloutCheckSchema>

export const balancingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BalancingizabilityRolloutStatus = z.infer<typeof balancingizabilityRolloutStatusSchema>

export const balancingizabilityCapabilitiesResponseSchema = z.object({
  supportsBalancingizabilityRollout: z.literal(true),
  supportsBalancingizabilityAdminTools: z.literal(true),
  supportsModelHealthBalancingizabilitySignals: z.literal(true),
  supportsModelRegistryBalancingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BalancingizabilityCapabilitiesResponse = z.infer<
  typeof balancingizabilityCapabilitiesResponseSchema
>

export const balancingizabilityRolloutResponseSchema = z.object({
  status: balancingizabilityRolloutStatusSchema,
  checks: z.array(balancingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BalancingizabilityRolloutResponse = z.infer<
  typeof balancingizabilityRolloutResponseSchema
>

export function getBalancingizabilityRolloutGuidance() {
  return 'Production balancingizability rollout validates model health balancingizability, model registry balancingizability signals, billing record coverage, and optimization readiness before production balancingizability tooling.'
}
