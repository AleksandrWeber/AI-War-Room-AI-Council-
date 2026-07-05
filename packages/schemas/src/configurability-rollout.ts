import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const configurabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConfigurabilityRolloutCheckStatus = z.infer<
  typeof configurabilityRolloutCheckStatusSchema
>

export const configurabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: configurabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConfigurabilityRolloutCheck = z.infer<typeof configurabilityRolloutCheckSchema>

export const configurabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConfigurabilityRolloutStatus = z.infer<typeof configurabilityRolloutStatusSchema>

export const configurabilityCapabilitiesResponseSchema = z.object({
  supportsConfigurabilityRollout: z.literal(true),
  supportsConfigurabilityAdminTools: z.literal(true),
  supportsProviderCredentialConfigurabilitySignals: z.literal(true),
  supportsWorkspaceLimitConfigurabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConfigurabilityCapabilitiesResponse = z.infer<
  typeof configurabilityCapabilitiesResponseSchema
>

export const configurabilityRolloutResponseSchema = z.object({
  status: configurabilityRolloutStatusSchema,
  checks: z.array(configurabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConfigurabilityRolloutResponse = z.infer<
  typeof configurabilityRolloutResponseSchema
>

export function getConfigurabilityRolloutGuidance() {
  return 'Production configurability rollout validates provider credential configurability, workspace limit configurability signals, meter usage coverage, and configuration readiness before production configurability tooling.'
}
