import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const bibliographizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BibliographizabilityRolloutCheckStatus = z.infer<
  typeof bibliographizabilityRolloutCheckStatusSchema
>

export const bibliographizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: bibliographizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BibliographizabilityRolloutCheck = z.infer<typeof bibliographizabilityRolloutCheckSchema>

export const bibliographizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BibliographizabilityRolloutStatus = z.infer<typeof bibliographizabilityRolloutStatusSchema>

export const bibliographizabilityCapabilitiesResponseSchema = z.object({
  supportsBibliographizabilityRollout: z.literal(true),
  supportsBibliographizabilityAdminTools: z.literal(true),
  supportsShieldScanBibliographizabilitySignals: z.literal(true),
  supportsProviderCredentialBibliographizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BibliographizabilityCapabilitiesResponse = z.infer<
  typeof bibliographizabilityCapabilitiesResponseSchema
>

export const bibliographizabilityRolloutResponseSchema = z.object({
  status: bibliographizabilityRolloutStatusSchema,
  checks: z.array(bibliographizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BibliographizabilityRolloutResponse = z.infer<
  typeof bibliographizabilityRolloutResponseSchema
>

export function getBibliographizabilityRolloutGuidance() {
  return 'Production bibliographizability rollout validates shield scan bibliographizability, provider credential bibliographizability signals, billing webhook coverage, and bibliographization readiness before production bibliographizability tooling.'
}
