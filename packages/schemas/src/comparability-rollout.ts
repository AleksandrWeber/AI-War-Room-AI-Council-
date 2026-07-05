import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const comparabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComparabilityRolloutCheckStatus = z.infer<
  typeof comparabilityRolloutCheckStatusSchema
>

export const comparabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: comparabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComparabilityRolloutCheck = z.infer<typeof comparabilityRolloutCheckSchema>

export const comparabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComparabilityRolloutStatus = z.infer<typeof comparabilityRolloutStatusSchema>

export const comparabilityCapabilitiesResponseSchema = z.object({
  supportsComparabilityRollout: z.literal(true),
  supportsComparabilityAdminTools: z.literal(true),
  supportsBillingInvoiceComparabilitySignals: z.literal(true),
  supportsBillingRecordComparabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComparabilityCapabilitiesResponse = z.infer<
  typeof comparabilityCapabilitiesResponseSchema
>

export const comparabilityRolloutResponseSchema = z.object({
  status: comparabilityRolloutStatusSchema,
  checks: z.array(comparabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComparabilityRolloutResponse = z.infer<
  typeof comparabilityRolloutResponseSchema
>

export function getComparabilityRolloutGuidance() {
  return 'Production comparability rollout validates billing invoice comparability, billing record comparability signals, meter usage coverage, and comparison readiness before production comparability tooling.'
}
