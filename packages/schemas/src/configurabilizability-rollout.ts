import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const configurabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConfigurabilizabilityRolloutCheckStatus = z.infer<
  typeof configurabilizabilityRolloutCheckStatusSchema
>

export const configurabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: configurabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConfigurabilizabilityRolloutCheck = z.infer<typeof configurabilizabilityRolloutCheckSchema>

export const configurabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConfigurabilizabilityRolloutStatus = z.infer<typeof configurabilizabilityRolloutStatusSchema>

export const configurabilizabilityCapabilitiesResponseSchema = z.object({
  supportsConfigurabilizabilityRollout: z.literal(true),
  supportsConfigurabilizabilityAdminTools: z.literal(true),
  supportsShieldScanConfigurabilizabilitySignals: z.literal(true),
  supportsProviderCredentialConfigurabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConfigurabilizabilityCapabilitiesResponse = z.infer<
  typeof configurabilizabilityCapabilitiesResponseSchema
>

export const configurabilizabilityRolloutResponseSchema = z.object({
  status: configurabilizabilityRolloutStatusSchema,
  checks: z.array(configurabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConfigurabilizabilityRolloutResponse = z.infer<
  typeof configurabilizabilityRolloutResponseSchema
>

export function getConfigurabilizabilityRolloutGuidance() {
  return 'Production configurabilizability rollout validates shield scan configurabilizability, provider credential configurabilizability signals, billing webhook coverage, and configurabilization readiness before production configurabilizability tooling.'
}
