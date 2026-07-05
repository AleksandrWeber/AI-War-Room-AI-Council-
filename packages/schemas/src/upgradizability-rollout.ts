import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const upgradizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type UpgradizabilityRolloutCheckStatus = z.infer<
  typeof upgradizabilityRolloutCheckStatusSchema
>

export const upgradizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: upgradizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type UpgradizabilityRolloutCheck = z.infer<typeof upgradizabilityRolloutCheckSchema>

export const upgradizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type UpgradizabilityRolloutStatus = z.infer<typeof upgradizabilityRolloutStatusSchema>

export const upgradizabilityCapabilitiesResponseSchema = z.object({
  supportsUpgradizabilityRollout: z.literal(true),
  supportsUpgradizabilityAdminTools: z.literal(true),
  supportsProviderCredentialUpgradizabilitySignals: z.literal(true),
  supportsModelRegistryUpgradizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type UpgradizabilityCapabilitiesResponse = z.infer<
  typeof upgradizabilityCapabilitiesResponseSchema
>

export const upgradizabilityRolloutResponseSchema = z.object({
  status: upgradizabilityRolloutStatusSchema,
  checks: z.array(upgradizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type UpgradizabilityRolloutResponse = z.infer<
  typeof upgradizabilityRolloutResponseSchema
>

export function getUpgradizabilityRolloutGuidance() {
  return 'Production upgradizability rollout validates provider credential upgradizability, model registry upgradizability signals, billing webhook coverage, and upgradization readiness before production upgradizability tooling.'
}
