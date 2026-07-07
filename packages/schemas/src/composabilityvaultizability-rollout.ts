import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const composabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComposabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof composabilityvaultizabilityRolloutCheckStatusSchema
>

export const composabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: composabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComposabilityvaultizabilityRolloutCheck = z.infer<typeof composabilityvaultizabilityRolloutCheckSchema>

export const composabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComposabilityvaultizabilityRolloutStatus = z.infer<typeof composabilityvaultizabilityRolloutStatusSchema>

export const composabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsComposabilityvaultizabilityRollout: z.literal(true),
  supportsComposabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanComposabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialComposabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComposabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof composabilityvaultizabilityCapabilitiesResponseSchema
>

export const composabilityvaultizabilityRolloutResponseSchema = z.object({
  status: composabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(composabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComposabilityvaultizabilityRolloutResponse = z.infer<
  typeof composabilityvaultizabilityRolloutResponseSchema
>

export function getComposabilityvaultizabilityRolloutGuidance() {
  return 'Production composabilityvaultizability rollout validates shield scan composabilityvaultizability, provider credential composabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production composabilityvaultizability tooling.'
}
