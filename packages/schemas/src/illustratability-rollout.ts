import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const illustratabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IllustratabilityRolloutCheckStatus = z.infer<
  typeof illustratabilityRolloutCheckStatusSchema
>

export const illustratabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: illustratabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IllustratabilityRolloutCheck = z.infer<typeof illustratabilityRolloutCheckSchema>

export const illustratabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IllustratabilityRolloutStatus = z.infer<typeof illustratabilityRolloutStatusSchema>

export const illustratabilityCapabilitiesResponseSchema = z.object({
  supportsIllustratabilityRollout: z.literal(true),
  supportsIllustratabilityAdminTools: z.literal(true),
  supportsShieldScanIllustratabilitySignals: z.literal(true),
  supportsProviderCredentialIllustratabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IllustratabilityCapabilitiesResponse = z.infer<
  typeof illustratabilityCapabilitiesResponseSchema
>

export const illustratabilityRolloutResponseSchema = z.object({
  status: illustratabilityRolloutStatusSchema,
  checks: z.array(illustratabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IllustratabilityRolloutResponse = z.infer<
  typeof illustratabilityRolloutResponseSchema
>

export function getIllustratabilityRolloutGuidance() {
  return 'Production illustratability rollout validates shield scan illustratability, provider credential illustratability signals, billing webhook coverage, and illustration readiness before production illustratability tooling.'
}
