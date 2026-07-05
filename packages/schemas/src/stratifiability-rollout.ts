import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const stratifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StratifiabilityRolloutCheckStatus = z.infer<
  typeof stratifiabilityRolloutCheckStatusSchema
>

export const stratifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: stratifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StratifiabilityRolloutCheck = z.infer<typeof stratifiabilityRolloutCheckSchema>

export const stratifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StratifiabilityRolloutStatus = z.infer<typeof stratifiabilityRolloutStatusSchema>

export const stratifiabilityCapabilitiesResponseSchema = z.object({
  supportsStratifiabilityRollout: z.literal(true),
  supportsStratifiabilityAdminTools: z.literal(true),
  supportsBillingInvoiceStratifiabilitySignals: z.literal(true),
  supportsBillingRecordStratifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StratifiabilityCapabilitiesResponse = z.infer<
  typeof stratifiabilityCapabilitiesResponseSchema
>

export const stratifiabilityRolloutResponseSchema = z.object({
  status: stratifiabilityRolloutStatusSchema,
  checks: z.array(stratifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StratifiabilityRolloutResponse = z.infer<
  typeof stratifiabilityRolloutResponseSchema
>

export function getStratifiabilityRolloutGuidance() {
  return 'Production stratifiability rollout validates billing invoice stratifiability, billing record stratifiability signals, billing webhook coverage, and stratification readiness before production stratifiability tooling.'
}
