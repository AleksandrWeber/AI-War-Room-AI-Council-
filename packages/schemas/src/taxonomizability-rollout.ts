import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const taxonomizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TaxonomizabilityRolloutCheckStatus = z.infer<
  typeof taxonomizabilityRolloutCheckStatusSchema
>

export const taxonomizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: taxonomizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TaxonomizabilityRolloutCheck = z.infer<typeof taxonomizabilityRolloutCheckSchema>

export const taxonomizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TaxonomizabilityRolloutStatus = z.infer<typeof taxonomizabilityRolloutStatusSchema>

export const taxonomizabilityCapabilitiesResponseSchema = z.object({
  supportsTaxonomizabilityRollout: z.literal(true),
  supportsTaxonomizabilityAdminTools: z.literal(true),
  supportsShieldScanTaxonomizabilitySignals: z.literal(true),
  supportsProviderCredentialTaxonomizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TaxonomizabilityCapabilitiesResponse = z.infer<
  typeof taxonomizabilityCapabilitiesResponseSchema
>

export const taxonomizabilityRolloutResponseSchema = z.object({
  status: taxonomizabilityRolloutStatusSchema,
  checks: z.array(taxonomizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TaxonomizabilityRolloutResponse = z.infer<
  typeof taxonomizabilityRolloutResponseSchema
>

export function getTaxonomizabilityRolloutGuidance() {
  return 'Production taxonomizability rollout validates shield scan taxonomizability, provider credential taxonomizability signals, billing webhook coverage, and taxonomization readiness before production taxonomizability tooling.'
}
