import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const alertabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AlertabilizabilityRolloutCheckStatus = z.infer<
  typeof alertabilizabilityRolloutCheckStatusSchema
>

export const alertabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: alertabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AlertabilizabilityRolloutCheck = z.infer<typeof alertabilizabilityRolloutCheckSchema>

export const alertabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AlertabilizabilityRolloutStatus = z.infer<typeof alertabilizabilityRolloutStatusSchema>

export const alertabilizabilityCapabilitiesResponseSchema = z.object({
  supportsAlertabilizabilityRollout: z.literal(true),
  supportsAlertabilizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAlertabilizabilitySignals: z.literal(true),
  supportsBillingRecordAlertabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AlertabilizabilityCapabilitiesResponse = z.infer<
  typeof alertabilizabilityCapabilitiesResponseSchema
>

export const alertabilizabilityRolloutResponseSchema = z.object({
  status: alertabilizabilityRolloutStatusSchema,
  checks: z.array(alertabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AlertabilizabilityRolloutResponse = z.infer<
  typeof alertabilizabilityRolloutResponseSchema
>

export function getAlertabilizabilityRolloutGuidance() {
  return 'Production alertabilizability rollout validates billing invoice alertabilizability, billing record alertabilizability signals, billing webhook coverage, and alertabilization readiness before production alertabilizability tooling.'
}
