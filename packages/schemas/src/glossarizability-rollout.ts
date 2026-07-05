import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const glossarizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GlossarizabilityRolloutCheckStatus = z.infer<
  typeof glossarizabilityRolloutCheckStatusSchema
>

export const glossarizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: glossarizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GlossarizabilityRolloutCheck = z.infer<typeof glossarizabilityRolloutCheckSchema>

export const glossarizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GlossarizabilityRolloutStatus = z.infer<typeof glossarizabilityRolloutStatusSchema>

export const glossarizabilityCapabilitiesResponseSchema = z.object({
  supportsGlossarizabilityRollout: z.literal(true),
  supportsGlossarizabilityAdminTools: z.literal(true),
  supportsShieldScanGlossarizabilitySignals: z.literal(true),
  supportsProviderCredentialGlossarizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GlossarizabilityCapabilitiesResponse = z.infer<
  typeof glossarizabilityCapabilitiesResponseSchema
>

export const glossarizabilityRolloutResponseSchema = z.object({
  status: glossarizabilityRolloutStatusSchema,
  checks: z.array(glossarizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GlossarizabilityRolloutResponse = z.infer<
  typeof glossarizabilityRolloutResponseSchema
>

export function getGlossarizabilityRolloutGuidance() {
  return 'Production glossarizability rollout validates shield scan glossarizability, provider credential glossarizability signals, billing webhook coverage, and glossarization readiness before production glossarizability tooling.'
}
