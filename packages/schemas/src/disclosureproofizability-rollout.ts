import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const disclosureproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DisclosureproofizabilityRolloutCheckStatus = z.infer<
  typeof disclosureproofizabilityRolloutCheckStatusSchema
>

export const disclosureproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: disclosureproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DisclosureproofizabilityRolloutCheck = z.infer<typeof disclosureproofizabilityRolloutCheckSchema>

export const disclosureproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DisclosureproofizabilityRolloutStatus = z.infer<typeof disclosureproofizabilityRolloutStatusSchema>

export const disclosureproofizabilityCapabilitiesResponseSchema = z.object({
  supportsDisclosureproofizabilityRollout: z.literal(true),
  supportsDisclosureproofizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyDisclosureproofizabilitySignals: z.literal(true),
  supportsUsageEventDisclosureproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DisclosureproofizabilityCapabilitiesResponse = z.infer<
  typeof disclosureproofizabilityCapabilitiesResponseSchema
>

export const disclosureproofizabilityRolloutResponseSchema = z.object({
  status: disclosureproofizabilityRolloutStatusSchema,
  checks: z.array(disclosureproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DisclosureproofizabilityRolloutResponse = z.infer<
  typeof disclosureproofizabilityRolloutResponseSchema
>

export function getDisclosureproofizabilityRolloutGuidance() {
  return 'Production disclosureproofizability rollout validates idempotency key disclosureproofizability, usage event disclosureproofizability signals, billing webhook coverage, and remediationization readiness before production disclosureproofizability tooling.'
}
