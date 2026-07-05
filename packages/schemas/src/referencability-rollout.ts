import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const referencabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReferencabilityRolloutCheckStatus = z.infer<
  typeof referencabilityRolloutCheckStatusSchema
>

export const referencabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: referencabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReferencabilityRolloutCheck = z.infer<typeof referencabilityRolloutCheckSchema>

export const referencabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReferencabilityRolloutStatus = z.infer<typeof referencabilityRolloutStatusSchema>

export const referencabilityCapabilitiesResponseSchema = z.object({
  supportsReferencabilityRollout: z.literal(true),
  supportsReferencabilityAdminTools: z.literal(true),
  supportsArtifactReferencabilitySignals: z.literal(true),
  supportsWorkflowReferencabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReferencabilityCapabilitiesResponse = z.infer<
  typeof referencabilityCapabilitiesResponseSchema
>

export const referencabilityRolloutResponseSchema = z.object({
  status: referencabilityRolloutStatusSchema,
  checks: z.array(referencabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReferencabilityRolloutResponse = z.infer<
  typeof referencabilityRolloutResponseSchema
>

export function getReferencabilityRolloutGuidance() {
  return 'Production referencability rollout validates artifact referencability, workflow referencability signals, billing record coverage, and reference readiness before production referencability tooling.'
}
