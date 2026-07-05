import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const viabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ViabilityRolloutCheckStatus = z.infer<
  typeof viabilityRolloutCheckStatusSchema
>

export const viabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: viabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ViabilityRolloutCheck = z.infer<typeof viabilityRolloutCheckSchema>

export const viabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ViabilityRolloutStatus = z.infer<typeof viabilityRolloutStatusSchema>

export const viabilityCapabilitiesResponseSchema = z.object({
  supportsViabilityRollout: z.literal(true),
  supportsViabilityAdminTools: z.literal(true),
  supportsBillingInvoiceViabilitySignals: z.literal(true),
  supportsBillingRecordViabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ViabilityCapabilitiesResponse = z.infer<
  typeof viabilityCapabilitiesResponseSchema
>

export const viabilityRolloutResponseSchema = z.object({
  status: viabilityRolloutStatusSchema,
  checks: z.array(viabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ViabilityRolloutResponse = z.infer<
  typeof viabilityRolloutResponseSchema
>

export function getViabilityRolloutGuidance() {
  return 'Production viability rollout validates billing invoice viability, billing record viability signals, billing notification coverage, and viability readiness before production viability tooling.'
}
