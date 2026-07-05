import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const iconizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IconizabilityRolloutCheckStatus = z.infer<
  typeof iconizabilityRolloutCheckStatusSchema
>

export const iconizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: iconizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IconizabilityRolloutCheck = z.infer<typeof iconizabilityRolloutCheckSchema>

export const iconizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IconizabilityRolloutStatus = z.infer<typeof iconizabilityRolloutStatusSchema>

export const iconizabilityCapabilitiesResponseSchema = z.object({
  supportsIconizabilityRollout: z.literal(true),
  supportsIconizabilityAdminTools: z.literal(true),
  supportsShieldScanIconizabilitySignals: z.literal(true),
  supportsProviderCredentialIconizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IconizabilityCapabilitiesResponse = z.infer<
  typeof iconizabilityCapabilitiesResponseSchema
>

export const iconizabilityRolloutResponseSchema = z.object({
  status: iconizabilityRolloutStatusSchema,
  checks: z.array(iconizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IconizabilityRolloutResponse = z.infer<
  typeof iconizabilityRolloutResponseSchema
>

export function getIconizabilityRolloutGuidance() {
  return 'Production iconizability rollout validates shield scan iconizability, provider credential iconizability signals, billing webhook coverage, and iconization readiness before production iconizability tooling.'
}
