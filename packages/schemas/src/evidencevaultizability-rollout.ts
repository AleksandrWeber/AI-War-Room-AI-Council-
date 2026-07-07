import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const evidencevaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EvidencevaultizabilityRolloutCheckStatus = z.infer<
  typeof evidencevaultizabilityRolloutCheckStatusSchema
>

export const evidencevaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: evidencevaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EvidencevaultizabilityRolloutCheck = z.infer<typeof evidencevaultizabilityRolloutCheckSchema>

export const evidencevaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EvidencevaultizabilityRolloutStatus = z.infer<typeof evidencevaultizabilityRolloutStatusSchema>

export const evidencevaultizabilityCapabilitiesResponseSchema = z.object({
  supportsEvidencevaultizabilityRollout: z.literal(true),
  supportsEvidencevaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyEvidencevaultizabilitySignals: z.literal(true),
  supportsUsageEventEvidencevaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EvidencevaultizabilityCapabilitiesResponse = z.infer<
  typeof evidencevaultizabilityCapabilitiesResponseSchema
>

export const evidencevaultizabilityRolloutResponseSchema = z.object({
  status: evidencevaultizabilityRolloutStatusSchema,
  checks: z.array(evidencevaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EvidencevaultizabilityRolloutResponse = z.infer<
  typeof evidencevaultizabilityRolloutResponseSchema
>

export function getEvidencevaultizabilityRolloutGuidance() {
  return 'Production evidencevaultizability rollout validates idempotency key evidencevaultizability, usage event evidencevaultizability signals, billing webhook coverage, and remediationization readiness before production evidencevaultizability tooling.'
}
