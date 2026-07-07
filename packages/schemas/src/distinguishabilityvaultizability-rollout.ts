import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const distinguishabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DistinguishabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof distinguishabilityvaultizabilityRolloutCheckStatusSchema
>

export const distinguishabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: distinguishabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DistinguishabilityvaultizabilityRolloutCheck = z.infer<typeof distinguishabilityvaultizabilityRolloutCheckSchema>

export const distinguishabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DistinguishabilityvaultizabilityRolloutStatus = z.infer<typeof distinguishabilityvaultizabilityRolloutStatusSchema>

export const distinguishabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsDistinguishabilityvaultizabilityRollout: z.literal(true),
  supportsDistinguishabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanDistinguishabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialDistinguishabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DistinguishabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof distinguishabilityvaultizabilityCapabilitiesResponseSchema
>

export const distinguishabilityvaultizabilityRolloutResponseSchema = z.object({
  status: distinguishabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(distinguishabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DistinguishabilityvaultizabilityRolloutResponse = z.infer<
  typeof distinguishabilityvaultizabilityRolloutResponseSchema
>

export function getDistinguishabilityvaultizabilityRolloutGuidance() {
  return 'Production distinguishabilityvaultizability rollout validates shield scan distinguishabilityvaultizability, provider credential distinguishabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production distinguishabilityvaultizability tooling.'
}
