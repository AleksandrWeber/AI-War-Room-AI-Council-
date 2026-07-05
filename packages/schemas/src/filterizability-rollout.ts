import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const filterizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FilterizabilityRolloutCheckStatus = z.infer<
  typeof filterizabilityRolloutCheckStatusSchema
>

export const filterizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: filterizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FilterizabilityRolloutCheck = z.infer<typeof filterizabilityRolloutCheckSchema>

export const filterizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FilterizabilityRolloutStatus = z.infer<typeof filterizabilityRolloutStatusSchema>

export const filterizabilityCapabilitiesResponseSchema = z.object({
  supportsFilterizabilityRollout: z.literal(true),
  supportsFilterizabilityAdminTools: z.literal(true),
  supportsMeterUsageFilterizabilitySignals: z.literal(true),
  supportsUsageEventFilterizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FilterizabilityCapabilitiesResponse = z.infer<
  typeof filterizabilityCapabilitiesResponseSchema
>

export const filterizabilityRolloutResponseSchema = z.object({
  status: filterizabilityRolloutStatusSchema,
  checks: z.array(filterizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FilterizabilityRolloutResponse = z.infer<
  typeof filterizabilityRolloutResponseSchema
>

export function getFilterizabilityRolloutGuidance() {
  return 'Production filterizability rollout validates meter usage filterizability, usage event filterizability signals, workspace limit coverage, and filterization readiness before production filterizability tooling.'
}
