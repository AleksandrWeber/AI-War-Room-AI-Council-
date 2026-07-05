import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const symbolizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SymbolizabilityRolloutCheckStatus = z.infer<
  typeof symbolizabilityRolloutCheckStatusSchema
>

export const symbolizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: symbolizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SymbolizabilityRolloutCheck = z.infer<typeof symbolizabilityRolloutCheckSchema>

export const symbolizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SymbolizabilityRolloutStatus = z.infer<typeof symbolizabilityRolloutStatusSchema>

export const symbolizabilityCapabilitiesResponseSchema = z.object({
  supportsSymbolizabilityRollout: z.literal(true),
  supportsSymbolizabilityAdminTools: z.literal(true),
  supportsBillingRecordSymbolizabilitySignals: z.literal(true),
  supportsBillingInvoiceSymbolizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SymbolizabilityCapabilitiesResponse = z.infer<
  typeof symbolizabilityCapabilitiesResponseSchema
>

export const symbolizabilityRolloutResponseSchema = z.object({
  status: symbolizabilityRolloutStatusSchema,
  checks: z.array(symbolizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SymbolizabilityRolloutResponse = z.infer<
  typeof symbolizabilityRolloutResponseSchema
>

export function getSymbolizabilityRolloutGuidance() {
  return 'Production symbolizability rollout validates billing record symbolizability, billing invoice symbolizability signals, usage event coverage, and symbolization readiness before production symbolizability tooling.'
}
