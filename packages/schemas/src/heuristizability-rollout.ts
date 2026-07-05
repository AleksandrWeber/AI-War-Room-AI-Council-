import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const heuristizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HeuristizabilityRolloutCheckStatus = z.infer<
  typeof heuristizabilityRolloutCheckStatusSchema
>

export const heuristizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: heuristizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HeuristizabilityRolloutCheck = z.infer<typeof heuristizabilityRolloutCheckSchema>

export const heuristizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HeuristizabilityRolloutStatus = z.infer<typeof heuristizabilityRolloutStatusSchema>

export const heuristizabilityCapabilitiesResponseSchema = z.object({
  supportsHeuristizabilityRollout: z.literal(true),
  supportsHeuristizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitHeuristizabilitySignals: z.literal(true),
  supportsUsageEventHeuristizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HeuristizabilityCapabilitiesResponse = z.infer<
  typeof heuristizabilityCapabilitiesResponseSchema
>

export const heuristizabilityRolloutResponseSchema = z.object({
  status: heuristizabilityRolloutStatusSchema,
  checks: z.array(heuristizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HeuristizabilityRolloutResponse = z.infer<
  typeof heuristizabilityRolloutResponseSchema
>

export function getHeuristizabilityRolloutGuidance() {
  return 'Production heuristizability rollout validates workspace limit heuristizability, usage event heuristizability signals, billing record coverage, and heuristization readiness before production heuristizability tooling.'
}
