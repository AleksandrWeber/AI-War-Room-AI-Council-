import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const evidencizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EvidencizabilityRolloutCheckStatus = z.infer<
  typeof evidencizabilityRolloutCheckStatusSchema
>

export const evidencizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: evidencizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EvidencizabilityRolloutCheck = z.infer<typeof evidencizabilityRolloutCheckSchema>

export const evidencizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EvidencizabilityRolloutStatus = z.infer<typeof evidencizabilityRolloutStatusSchema>

export const evidencizabilityCapabilitiesResponseSchema = z.object({
  supportsEvidencizabilityRollout: z.literal(true),
  supportsEvidencizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyEvidencizabilitySignals: z.literal(true),
  supportsUsageEventEvidencizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EvidencizabilityCapabilitiesResponse = z.infer<
  typeof evidencizabilityCapabilitiesResponseSchema
>

export const evidencizabilityRolloutResponseSchema = z.object({
  status: evidencizabilityRolloutStatusSchema,
  checks: z.array(evidencizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EvidencizabilityRolloutResponse = z.infer<
  typeof evidencizabilityRolloutResponseSchema
>

export function getEvidencizabilityRolloutGuidance() {
  return 'Production evidencizability rollout validates idempotency key evidencizability, usage event evidencizability signals, billing webhook coverage, and remediationization readiness before production evidencizability tooling.'
}
