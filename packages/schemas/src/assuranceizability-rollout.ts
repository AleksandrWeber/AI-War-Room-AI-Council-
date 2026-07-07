import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assuranceizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssuranceizabilityRolloutCheckStatus = z.infer<
  typeof assuranceizabilityRolloutCheckStatusSchema
>

export const assuranceizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assuranceizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssuranceizabilityRolloutCheck = z.infer<typeof assuranceizabilityRolloutCheckSchema>

export const assuranceizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssuranceizabilityRolloutStatus = z.infer<typeof assuranceizabilityRolloutStatusSchema>

export const assuranceizabilityCapabilitiesResponseSchema = z.object({
  supportsAssuranceizabilityRollout: z.literal(true),
  supportsAssuranceizabilityAdminTools: z.literal(true),
  supportsShieldScanAssuranceizabilitySignals: z.literal(true),
  supportsProviderCredentialAssuranceizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssuranceizabilityCapabilitiesResponse = z.infer<
  typeof assuranceizabilityCapabilitiesResponseSchema
>

export const assuranceizabilityRolloutResponseSchema = z.object({
  status: assuranceizabilityRolloutStatusSchema,
  checks: z.array(assuranceizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssuranceizabilityRolloutResponse = z.infer<
  typeof assuranceizabilityRolloutResponseSchema
>

export function getAssuranceizabilityRolloutGuidance() {
  return 'Production assuranceizability rollout validates shield scan assuranceizability, provider credential assuranceizability signals, billing webhook coverage, and reconciliationization readiness before production assuranceizability tooling.'
}
