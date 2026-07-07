import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const substantiabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SubstantiabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof substantiabilityvaultizabilityRolloutCheckStatusSchema
>

export const substantiabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: substantiabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SubstantiabilityvaultizabilityRolloutCheck = z.infer<typeof substantiabilityvaultizabilityRolloutCheckSchema>

export const substantiabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SubstantiabilityvaultizabilityRolloutStatus = z.infer<typeof substantiabilityvaultizabilityRolloutStatusSchema>

export const substantiabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsSubstantiabilityvaultizabilityRollout: z.literal(true),
  supportsSubstantiabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanSubstantiabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialSubstantiabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SubstantiabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof substantiabilityvaultizabilityCapabilitiesResponseSchema
>

export const substantiabilityvaultizabilityRolloutResponseSchema = z.object({
  status: substantiabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(substantiabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SubstantiabilityvaultizabilityRolloutResponse = z.infer<
  typeof substantiabilityvaultizabilityRolloutResponseSchema
>

export function getSubstantiabilityvaultizabilityRolloutGuidance() {
  return 'Production substantiabilityvaultizability rollout validates shield scan substantiabilityvaultizability, provider credential substantiabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production substantiabilityvaultizability tooling.'
}
