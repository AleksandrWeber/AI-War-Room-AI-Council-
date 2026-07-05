import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dedupizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DedupizabilityRolloutCheckStatus = z.infer<
  typeof dedupizabilityRolloutCheckStatusSchema
>

export const dedupizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dedupizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DedupizabilityRolloutCheck = z.infer<typeof dedupizabilityRolloutCheckSchema>

export const dedupizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DedupizabilityRolloutStatus = z.infer<typeof dedupizabilityRolloutStatusSchema>

export const dedupizabilityCapabilitiesResponseSchema = z.object({
  supportsDedupizabilityRollout: z.literal(true),
  supportsDedupizabilityAdminTools: z.literal(true),
  supportsProviderCredentialDedupizabilitySignals: z.literal(true),
  supportsModelRegistryDedupizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DedupizabilityCapabilitiesResponse = z.infer<
  typeof dedupizabilityCapabilitiesResponseSchema
>

export const dedupizabilityRolloutResponseSchema = z.object({
  status: dedupizabilityRolloutStatusSchema,
  checks: z.array(dedupizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DedupizabilityRolloutResponse = z.infer<
  typeof dedupizabilityRolloutResponseSchema
>

export function getDedupizabilityRolloutGuidance() {
  return 'Production dedupizability rollout validates provider credential dedupizability, model registry dedupizability signals, billing webhook coverage, and dedupization readiness before production dedupizability tooling.'
}
