import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const registrarproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegistrarproofizabilityRolloutCheckStatus = z.infer<
  typeof registrarproofizabilityRolloutCheckStatusSchema
>

export const registrarproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: registrarproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegistrarproofizabilityRolloutCheck = z.infer<typeof registrarproofizabilityRolloutCheckSchema>

export const registrarproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegistrarproofizabilityRolloutStatus = z.infer<typeof registrarproofizabilityRolloutStatusSchema>

export const registrarproofizabilityCapabilitiesResponseSchema = z.object({
  supportsRegistrarproofizabilityRollout: z.literal(true),
  supportsRegistrarproofizabilityAdminTools: z.literal(true),
  supportsShieldScanRegistrarproofizabilitySignals: z.literal(true),
  supportsProviderCredentialRegistrarproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegistrarproofizabilityCapabilitiesResponse = z.infer<
  typeof registrarproofizabilityCapabilitiesResponseSchema
>

export const registrarproofizabilityRolloutResponseSchema = z.object({
  status: registrarproofizabilityRolloutStatusSchema,
  checks: z.array(registrarproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegistrarproofizabilityRolloutResponse = z.infer<
  typeof registrarproofizabilityRolloutResponseSchema
>

export function getRegistrarproofizabilityRolloutGuidance() {
  return 'Production registrarproofizability rollout validates shield scan registrarproofizability, provider credential registrarproofizability signals, billing webhook coverage, and reconciliationization readiness before production registrarproofizability tooling.'
}
