import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const controllabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ControllabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof controllabilityvaultizabilityRolloutCheckStatusSchema
>

export const controllabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: controllabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ControllabilityvaultizabilityRolloutCheck = z.infer<typeof controllabilityvaultizabilityRolloutCheckSchema>

export const controllabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ControllabilityvaultizabilityRolloutStatus = z.infer<typeof controllabilityvaultizabilityRolloutStatusSchema>

export const controllabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsControllabilityvaultizabilityRollout: z.literal(true),
  supportsControllabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanControllabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialControllabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ControllabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof controllabilityvaultizabilityCapabilitiesResponseSchema
>

export const controllabilityvaultizabilityRolloutResponseSchema = z.object({
  status: controllabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(controllabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ControllabilityvaultizabilityRolloutResponse = z.infer<
  typeof controllabilityvaultizabilityRolloutResponseSchema
>

export function getControllabilityvaultizabilityRolloutGuidance() {
  return 'Production controllabilityvaultizability rollout validates shield scan controllabilityvaultizability, provider credential controllabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production controllabilityvaultizability tooling.'
}
