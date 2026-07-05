import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const profitabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProfitabilityRolloutCheckStatus = z.infer<
  typeof profitabilityRolloutCheckStatusSchema
>

export const profitabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: profitabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProfitabilityRolloutCheck = z.infer<typeof profitabilityRolloutCheckSchema>

export const profitabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProfitabilityRolloutStatus = z.infer<typeof profitabilityRolloutStatusSchema>

export const profitabilityCapabilitiesResponseSchema = z.object({
  supportsProfitabilityRollout: z.literal(true),
  supportsProfitabilityAdminTools: z.literal(true),
  supportsBillingRecordProfitabilitySignals: z.literal(true),
  supportsBillingInvoiceProfitabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProfitabilityCapabilitiesResponse = z.infer<
  typeof profitabilityCapabilitiesResponseSchema
>

export const profitabilityRolloutResponseSchema = z.object({
  status: profitabilityRolloutStatusSchema,
  checks: z.array(profitabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProfitabilityRolloutResponse = z.infer<
  typeof profitabilityRolloutResponseSchema
>

export function getProfitabilityRolloutGuidance() {
  return 'Production profitability rollout validates billing record profitability, billing invoice profitability signals, meter usage coverage, and profitability readiness before production profitability tooling.'
}
