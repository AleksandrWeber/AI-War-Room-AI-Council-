import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const sortizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SortizabilityRolloutCheckStatus = z.infer<
  typeof sortizabilityRolloutCheckStatusSchema
>

export const sortizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: sortizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SortizabilityRolloutCheck = z.infer<typeof sortizabilityRolloutCheckSchema>

export const sortizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SortizabilityRolloutStatus = z.infer<typeof sortizabilityRolloutStatusSchema>

export const sortizabilityCapabilitiesResponseSchema = z.object({
  supportsSortizabilityRollout: z.literal(true),
  supportsSortizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitSortizabilitySignals: z.literal(true),
  supportsUsageEventSortizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SortizabilityCapabilitiesResponse = z.infer<
  typeof sortizabilityCapabilitiesResponseSchema
>

export const sortizabilityRolloutResponseSchema = z.object({
  status: sortizabilityRolloutStatusSchema,
  checks: z.array(sortizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SortizabilityRolloutResponse = z.infer<
  typeof sortizabilityRolloutResponseSchema
>

export function getSortizabilityRolloutGuidance() {
  return 'Production sortizability rollout validates workspace limit sortizability, usage event sortizability signals, billing record coverage, and sortization readiness before production sortizability tooling.'
}
