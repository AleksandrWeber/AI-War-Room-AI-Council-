import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const authenticationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuthenticationizabilityRolloutCheckStatus = z.infer<
  typeof authenticationizabilityRolloutCheckStatusSchema
>

export const authenticationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: authenticationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuthenticationizabilityRolloutCheck = z.infer<typeof authenticationizabilityRolloutCheckSchema>

export const authenticationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuthenticationizabilityRolloutStatus = z.infer<typeof authenticationizabilityRolloutStatusSchema>

export const authenticationizabilityCapabilitiesResponseSchema = z.object({
  supportsAuthenticationizabilityRollout: z.literal(true),
  supportsAuthenticationizabilityAdminTools: z.literal(true),
  supportsShieldScanAuthenticationizabilitySignals: z.literal(true),
  supportsProviderCredentialAuthenticationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuthenticationizabilityCapabilitiesResponse = z.infer<
  typeof authenticationizabilityCapabilitiesResponseSchema
>

export const authenticationizabilityRolloutResponseSchema = z.object({
  status: authenticationizabilityRolloutStatusSchema,
  checks: z.array(authenticationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuthenticationizabilityRolloutResponse = z.infer<
  typeof authenticationizabilityRolloutResponseSchema
>

export function getAuthenticationizabilityRolloutGuidance() {
  return 'Production authenticationizability rollout validates shield scan authenticationizability, provider credential authenticationizability signals, billing webhook coverage, and reconciliationization readiness before production authenticationizability tooling.'
}
