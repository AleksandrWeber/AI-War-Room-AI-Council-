import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const discoverabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DiscoverabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof discoverabilityvaultizabilityRolloutCheckStatusSchema
>

export const discoverabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: discoverabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DiscoverabilityvaultizabilityRolloutCheck = z.infer<typeof discoverabilityvaultizabilityRolloutCheckSchema>

export const discoverabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DiscoverabilityvaultizabilityRolloutStatus = z.infer<typeof discoverabilityvaultizabilityRolloutStatusSchema>

export const discoverabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsDiscoverabilityvaultizabilityRollout: z.literal(true),
  supportsDiscoverabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanDiscoverabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialDiscoverabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DiscoverabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof discoverabilityvaultizabilityCapabilitiesResponseSchema
>

export const discoverabilityvaultizabilityRolloutResponseSchema = z.object({
  status: discoverabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(discoverabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DiscoverabilityvaultizabilityRolloutResponse = z.infer<
  typeof discoverabilityvaultizabilityRolloutResponseSchema
>

export function getDiscoverabilityvaultizabilityRolloutGuidance() {
  return 'Production discoverabilityvaultizability rollout validates shield scan discoverabilityvaultizability, provider credential discoverabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production discoverabilityvaultizability tooling.'
}
