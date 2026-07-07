import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const hardeningizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HardeningizabilityRolloutCheckStatus = z.infer<
  typeof hardeningizabilityRolloutCheckStatusSchema
>

export const hardeningizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: hardeningizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HardeningizabilityRolloutCheck = z.infer<typeof hardeningizabilityRolloutCheckSchema>

export const hardeningizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HardeningizabilityRolloutStatus = z.infer<typeof hardeningizabilityRolloutStatusSchema>

export const hardeningizabilityCapabilitiesResponseSchema = z.object({
  supportsHardeningizabilityRollout: z.literal(true),
  supportsHardeningizabilityAdminTools: z.literal(true),
  supportsShieldScanHardeningizabilitySignals: z.literal(true),
  supportsProviderCredentialHardeningizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HardeningizabilityCapabilitiesResponse = z.infer<
  typeof hardeningizabilityCapabilitiesResponseSchema
>

export const hardeningizabilityRolloutResponseSchema = z.object({
  status: hardeningizabilityRolloutStatusSchema,
  checks: z.array(hardeningizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HardeningizabilityRolloutResponse = z.infer<
  typeof hardeningizabilityRolloutResponseSchema
>

export function getHardeningizabilityRolloutGuidance() {
  return 'Production hardeningizability rollout validates shield scan hardeningizability, provider credential hardeningizability signals, billing webhook coverage, and reconciliationization readiness before production hardeningizability tooling.'
}
