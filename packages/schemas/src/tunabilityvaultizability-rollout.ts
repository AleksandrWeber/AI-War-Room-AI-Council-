import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tunabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TunabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof tunabilityvaultizabilityRolloutCheckStatusSchema
>

export const tunabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tunabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TunabilityvaultizabilityRolloutCheck = z.infer<typeof tunabilityvaultizabilityRolloutCheckSchema>

export const tunabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TunabilityvaultizabilityRolloutStatus = z.infer<typeof tunabilityvaultizabilityRolloutStatusSchema>

export const tunabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsTunabilityvaultizabilityRollout: z.literal(true),
  supportsTunabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanTunabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialTunabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TunabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof tunabilityvaultizabilityCapabilitiesResponseSchema
>

export const tunabilityvaultizabilityRolloutResponseSchema = z.object({
  status: tunabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(tunabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TunabilityvaultizabilityRolloutResponse = z.infer<
  typeof tunabilityvaultizabilityRolloutResponseSchema
>

export function getTunabilityvaultizabilityRolloutGuidance() {
  return 'Production tunabilityvaultizability rollout validates shield scan tunabilityvaultizability, provider credential tunabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production tunabilityvaultizability tooling.'
}
