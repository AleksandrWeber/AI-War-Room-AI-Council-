import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const affordabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AffordabilityRolloutCheckStatus = z.infer<
  typeof affordabilityRolloutCheckStatusSchema
>

export const affordabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: affordabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AffordabilityRolloutCheck = z.infer<typeof affordabilityRolloutCheckSchema>

export const affordabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AffordabilityRolloutStatus = z.infer<typeof affordabilityRolloutStatusSchema>

export const affordabilityCapabilitiesResponseSchema = z.object({
  supportsAffordabilityRollout: z.literal(true),
  supportsAffordabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAffordabilitySignals: z.literal(true),
  supportsBillingRecordAffordabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AffordabilityCapabilitiesResponse = z.infer<
  typeof affordabilityCapabilitiesResponseSchema
>

export const affordabilityRolloutResponseSchema = z.object({
  status: affordabilityRolloutStatusSchema,
  checks: z.array(affordabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AffordabilityRolloutResponse = z.infer<
  typeof affordabilityRolloutResponseSchema
>

export function getAffordabilityRolloutGuidance() {
  return 'Production affordability rollout validates billing invoice affordability, billing record affordability signals, workspace limit coverage, and affordability readiness before production affordability tooling.'
}
