import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const archetypizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ArchetypizabilityRolloutCheckStatus = z.infer<
  typeof archetypizabilityRolloutCheckStatusSchema
>

export const archetypizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: archetypizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ArchetypizabilityRolloutCheck = z.infer<typeof archetypizabilityRolloutCheckSchema>

export const archetypizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ArchetypizabilityRolloutStatus = z.infer<typeof archetypizabilityRolloutStatusSchema>

export const archetypizabilityCapabilitiesResponseSchema = z.object({
  supportsArchetypizabilityRollout: z.literal(true),
  supportsArchetypizabilityAdminTools: z.literal(true),
  supportsBillingRecordArchetypizabilitySignals: z.literal(true),
  supportsBillingInvoiceArchetypizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ArchetypizabilityCapabilitiesResponse = z.infer<
  typeof archetypizabilityCapabilitiesResponseSchema
>

export const archetypizabilityRolloutResponseSchema = z.object({
  status: archetypizabilityRolloutStatusSchema,
  checks: z.array(archetypizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ArchetypizabilityRolloutResponse = z.infer<
  typeof archetypizabilityRolloutResponseSchema
>

export function getArchetypizabilityRolloutGuidance() {
  return 'Production archetypizability rollout validates billing record archetypizability, billing invoice archetypizability signals, usage event coverage, and archetypization readiness before production archetypizability tooling.'
}
