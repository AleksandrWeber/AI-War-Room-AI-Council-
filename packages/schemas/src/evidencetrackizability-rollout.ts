import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const evidencetrackizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EvidencetrackizabilityRolloutCheckStatus = z.infer<
  typeof evidencetrackizabilityRolloutCheckStatusSchema
>

export const evidencetrackizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: evidencetrackizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EvidencetrackizabilityRolloutCheck = z.infer<typeof evidencetrackizabilityRolloutCheckSchema>

export const evidencetrackizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EvidencetrackizabilityRolloutStatus = z.infer<typeof evidencetrackizabilityRolloutStatusSchema>

export const evidencetrackizabilityCapabilitiesResponseSchema = z.object({
  supportsEvidencetrackizabilityRollout: z.literal(true),
  supportsEvidencetrackizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyEvidencetrackizabilitySignals: z.literal(true),
  supportsUsageEventEvidencetrackizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EvidencetrackizabilityCapabilitiesResponse = z.infer<
  typeof evidencetrackizabilityCapabilitiesResponseSchema
>

export const evidencetrackizabilityRolloutResponseSchema = z.object({
  status: evidencetrackizabilityRolloutStatusSchema,
  checks: z.array(evidencetrackizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EvidencetrackizabilityRolloutResponse = z.infer<
  typeof evidencetrackizabilityRolloutResponseSchema
>

export function getEvidencetrackizabilityRolloutGuidance() {
  return 'Production evidencetrackizability rollout validates idempotency key evidencetrackizability, usage event evidencetrackizability signals, billing webhook coverage, and remediationization readiness before production evidencetrackizability tooling.'
}
