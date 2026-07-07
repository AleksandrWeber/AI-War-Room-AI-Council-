import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const entitlementizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EntitlementizabilityRolloutCheckStatus = z.infer<
  typeof entitlementizabilityRolloutCheckStatusSchema
>

export const entitlementizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: entitlementizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EntitlementizabilityRolloutCheck = z.infer<typeof entitlementizabilityRolloutCheckSchema>

export const entitlementizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EntitlementizabilityRolloutStatus = z.infer<typeof entitlementizabilityRolloutStatusSchema>

export const entitlementizabilityCapabilitiesResponseSchema = z.object({
  supportsEntitlementizabilityRollout: z.literal(true),
  supportsEntitlementizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceEntitlementizabilitySignals: z.literal(true),
  supportsBillingRecordEntitlementizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EntitlementizabilityCapabilitiesResponse = z.infer<
  typeof entitlementizabilityCapabilitiesResponseSchema
>

export const entitlementizabilityRolloutResponseSchema = z.object({
  status: entitlementizabilityRolloutStatusSchema,
  checks: z.array(entitlementizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EntitlementizabilityRolloutResponse = z.infer<
  typeof entitlementizabilityRolloutResponseSchema
>

export function getEntitlementizabilityRolloutGuidance() {
  return 'Production entitlementizability rollout validates billing invoice entitlementizability, billing record entitlementizability signals, billing webhook coverage, and scalingization readiness before production entitlementizability tooling.'
}
