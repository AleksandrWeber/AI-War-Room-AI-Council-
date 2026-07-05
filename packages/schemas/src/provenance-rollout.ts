import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const provenanceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProvenanceRolloutCheckStatus = z.infer<
  typeof provenanceRolloutCheckStatusSchema
>

export const provenanceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: provenanceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProvenanceRolloutCheck = z.infer<typeof provenanceRolloutCheckSchema>

export const provenanceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProvenanceRolloutStatus = z.infer<typeof provenanceRolloutStatusSchema>

export const provenanceCapabilitiesResponseSchema = z.object({
  supportsProvenanceRollout: z.literal(true),
  supportsProvenanceAdminTools: z.literal(true),
  supportsUsageProvenanceSignals: z.literal(true),
  supportsAgentOutputProvenanceSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProvenanceCapabilitiesResponse = z.infer<
  typeof provenanceCapabilitiesResponseSchema
>

export const provenanceRolloutResponseSchema = z.object({
  status: provenanceRolloutStatusSchema,
  checks: z.array(provenanceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProvenanceRolloutResponse = z.infer<
  typeof provenanceRolloutResponseSchema
>

export function getProvenanceRolloutGuidance() {
  return 'Production provenance rollout validates usage provenance, agent output provenance signals, artifact coverage, and lineage readiness before production provenance tooling.'
}
