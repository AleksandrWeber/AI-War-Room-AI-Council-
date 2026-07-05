import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const epistemizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EpistemizabilityRolloutCheckStatus = z.infer<
  typeof epistemizabilityRolloutCheckStatusSchema
>

export const epistemizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: epistemizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EpistemizabilityRolloutCheck = z.infer<typeof epistemizabilityRolloutCheckSchema>

export const epistemizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EpistemizabilityRolloutStatus = z.infer<typeof epistemizabilityRolloutStatusSchema>

export const epistemizabilityCapabilitiesResponseSchema = z.object({
  supportsEpistemizabilityRollout: z.literal(true),
  supportsEpistemizabilityAdminTools: z.literal(true),
  supportsShieldScanEpistemizabilitySignals: z.literal(true),
  supportsProviderCredentialEpistemizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EpistemizabilityCapabilitiesResponse = z.infer<
  typeof epistemizabilityCapabilitiesResponseSchema
>

export const epistemizabilityRolloutResponseSchema = z.object({
  status: epistemizabilityRolloutStatusSchema,
  checks: z.array(epistemizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EpistemizabilityRolloutResponse = z.infer<
  typeof epistemizabilityRolloutResponseSchema
>

export function getEpistemizabilityRolloutGuidance() {
  return 'Production epistemizability rollout validates shield scan epistemizability, provider credential epistemizability signals, billing webhook coverage, and epistemization readiness before production epistemizability tooling.'
}
