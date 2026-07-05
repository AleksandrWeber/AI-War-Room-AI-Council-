import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const thesaurusizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ThesaurusizabilityRolloutCheckStatus = z.infer<
  typeof thesaurusizabilityRolloutCheckStatusSchema
>

export const thesaurusizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: thesaurusizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ThesaurusizabilityRolloutCheck = z.infer<typeof thesaurusizabilityRolloutCheckSchema>

export const thesaurusizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ThesaurusizabilityRolloutStatus = z.infer<typeof thesaurusizabilityRolloutStatusSchema>

export const thesaurusizabilityCapabilitiesResponseSchema = z.object({
  supportsThesaurusizabilityRollout: z.literal(true),
  supportsThesaurusizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyThesaurusizabilitySignals: z.literal(true),
  supportsUsageEventThesaurusizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ThesaurusizabilityCapabilitiesResponse = z.infer<
  typeof thesaurusizabilityCapabilitiesResponseSchema
>

export const thesaurusizabilityRolloutResponseSchema = z.object({
  status: thesaurusizabilityRolloutStatusSchema,
  checks: z.array(thesaurusizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ThesaurusizabilityRolloutResponse = z.infer<
  typeof thesaurusizabilityRolloutResponseSchema
>

export function getThesaurusizabilityRolloutGuidance() {
  return 'Production thesaurusizability rollout validates idempotency key thesaurusizability, usage event thesaurusizability signals, billing webhook coverage, and thesaurization readiness before production thesaurusizability tooling.'
}
