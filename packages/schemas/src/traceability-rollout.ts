import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const traceabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TraceabilityRolloutCheckStatus = z.infer<
  typeof traceabilityRolloutCheckStatusSchema
>

export const traceabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: traceabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TraceabilityRolloutCheck = z.infer<
  typeof traceabilityRolloutCheckSchema
>

export const traceabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TraceabilityRolloutStatus = z.infer<
  typeof traceabilityRolloutStatusSchema
>

export const traceabilityCapabilitiesResponseSchema = z.object({
  supportsTraceabilityRollout: z.literal(true),
  supportsTraceabilityAdminTools: z.literal(true),
  supportsRunLineageSignals: z.literal(true),
  supportsArtifactLineageSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TraceabilityCapabilitiesResponse = z.infer<
  typeof traceabilityCapabilitiesResponseSchema
>

export const traceabilityRolloutResponseSchema = z.object({
  status: traceabilityRolloutStatusSchema,
  checks: z.array(traceabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TraceabilityRolloutResponse = z.infer<
  typeof traceabilityRolloutResponseSchema
>

export function getTraceabilityRolloutGuidance() {
  return 'Production traceability rollout validates run lineage, artifact lineage, usage event coverage, and lineage readiness before production traceability tooling.'
}
