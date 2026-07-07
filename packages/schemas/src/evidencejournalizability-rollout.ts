import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const evidencejournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EvidencejournalizabilityRolloutCheckStatus = z.infer<
  typeof evidencejournalizabilityRolloutCheckStatusSchema
>

export const evidencejournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: evidencejournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EvidencejournalizabilityRolloutCheck = z.infer<typeof evidencejournalizabilityRolloutCheckSchema>

export const evidencejournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EvidencejournalizabilityRolloutStatus = z.infer<typeof evidencejournalizabilityRolloutStatusSchema>

export const evidencejournalizabilityCapabilitiesResponseSchema = z.object({
  supportsEvidencejournalizabilityRollout: z.literal(true),
  supportsEvidencejournalizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyEvidencejournalizabilitySignals: z.literal(true),
  supportsUsageEventEvidencejournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EvidencejournalizabilityCapabilitiesResponse = z.infer<
  typeof evidencejournalizabilityCapabilitiesResponseSchema
>

export const evidencejournalizabilityRolloutResponseSchema = z.object({
  status: evidencejournalizabilityRolloutStatusSchema,
  checks: z.array(evidencejournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EvidencejournalizabilityRolloutResponse = z.infer<
  typeof evidencejournalizabilityRolloutResponseSchema
>

export function getEvidencejournalizabilityRolloutGuidance() {
  return 'Production evidencejournalizability rollout validates idempotency key evidencejournalizability, usage event evidencejournalizability signals, billing webhook coverage, and remediationization readiness before production evidencejournalizability tooling.'
}
