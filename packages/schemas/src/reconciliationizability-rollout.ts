import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reconciliationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReconciliationizabilityRolloutCheckStatus = z.infer<
  typeof reconciliationizabilityRolloutCheckStatusSchema
>

export const reconciliationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reconciliationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReconciliationizabilityRolloutCheck = z.infer<typeof reconciliationizabilityRolloutCheckSchema>

export const reconciliationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReconciliationizabilityRolloutStatus = z.infer<typeof reconciliationizabilityRolloutStatusSchema>

export const reconciliationizabilityCapabilitiesResponseSchema = z.object({
  supportsReconciliationizabilityRollout: z.literal(true),
  supportsReconciliationizabilityAdminTools: z.literal(true),
  supportsShieldScanReconciliationizabilitySignals: z.literal(true),
  supportsProviderCredentialReconciliationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReconciliationizabilityCapabilitiesResponse = z.infer<
  typeof reconciliationizabilityCapabilitiesResponseSchema
>

export const reconciliationizabilityRolloutResponseSchema = z.object({
  status: reconciliationizabilityRolloutStatusSchema,
  checks: z.array(reconciliationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReconciliationizabilityRolloutResponse = z.infer<
  typeof reconciliationizabilityRolloutResponseSchema
>

export function getReconciliationizabilityRolloutGuidance() {
  return 'Production reconciliationizability rollout validates shield scan reconciliationizability, provider credential reconciliationizability signals, billing webhook coverage, and reconciliationization readiness before production reconciliationizability tooling.'
}
