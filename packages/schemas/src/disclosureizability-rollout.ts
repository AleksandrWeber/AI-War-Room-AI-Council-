import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const disclosureizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DisclosureizabilityRolloutCheckStatus = z.infer<
  typeof disclosureizabilityRolloutCheckStatusSchema
>

export const disclosureizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: disclosureizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DisclosureizabilityRolloutCheck = z.infer<typeof disclosureizabilityRolloutCheckSchema>

export const disclosureizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DisclosureizabilityRolloutStatus = z.infer<typeof disclosureizabilityRolloutStatusSchema>

export const disclosureizabilityCapabilitiesResponseSchema = z.object({
  supportsDisclosureizabilityRollout: z.literal(true),
  supportsDisclosureizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyDisclosureizabilitySignals: z.literal(true),
  supportsUsageEventDisclosureizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DisclosureizabilityCapabilitiesResponse = z.infer<
  typeof disclosureizabilityCapabilitiesResponseSchema
>

export const disclosureizabilityRolloutResponseSchema = z.object({
  status: disclosureizabilityRolloutStatusSchema,
  checks: z.array(disclosureizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DisclosureizabilityRolloutResponse = z.infer<
  typeof disclosureizabilityRolloutResponseSchema
>

export function getDisclosureizabilityRolloutGuidance() {
  return 'Production disclosureizability rollout validates idempotency key disclosureizability, usage event disclosureizability signals, billing webhook coverage, and remediationization readiness before production disclosureizability tooling.'
}
