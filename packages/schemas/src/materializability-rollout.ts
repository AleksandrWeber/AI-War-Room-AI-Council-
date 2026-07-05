import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const materializabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MaterializabilityRolloutCheckStatus = z.infer<
  typeof materializabilityRolloutCheckStatusSchema
>

export const materializabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: materializabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MaterializabilityRolloutCheck = z.infer<typeof materializabilityRolloutCheckSchema>

export const materializabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MaterializabilityRolloutStatus = z.infer<typeof materializabilityRolloutStatusSchema>

export const materializabilityCapabilitiesResponseSchema = z.object({
  supportsMaterializabilityRollout: z.literal(true),
  supportsMaterializabilityAdminTools: z.literal(true),
  supportsWorkflowMaterializabilitySignals: z.literal(true),
  supportsArtifactMaterializabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MaterializabilityCapabilitiesResponse = z.infer<
  typeof materializabilityCapabilitiesResponseSchema
>

export const materializabilityRolloutResponseSchema = z.object({
  status: materializabilityRolloutStatusSchema,
  checks: z.array(materializabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MaterializabilityRolloutResponse = z.infer<
  typeof materializabilityRolloutResponseSchema
>

export function getMaterializabilityRolloutGuidance() {
  return 'Production materializability rollout validates workflow materializability, artifact materializability signals, billing notification coverage, and materialization readiness before production materializability tooling.'
}
