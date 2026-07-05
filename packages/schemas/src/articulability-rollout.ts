import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const articulabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ArticulabilityRolloutCheckStatus = z.infer<
  typeof articulabilityRolloutCheckStatusSchema
>

export const articulabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: articulabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ArticulabilityRolloutCheck = z.infer<typeof articulabilityRolloutCheckSchema>

export const articulabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ArticulabilityRolloutStatus = z.infer<typeof articulabilityRolloutStatusSchema>

export const articulabilityCapabilitiesResponseSchema = z.object({
  supportsArticulabilityRollout: z.literal(true),
  supportsArticulabilityAdminTools: z.literal(true),
  supportsArtifactArticulabilitySignals: z.literal(true),
  supportsWorkflowArticulabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ArticulabilityCapabilitiesResponse = z.infer<
  typeof articulabilityCapabilitiesResponseSchema
>

export const articulabilityRolloutResponseSchema = z.object({
  status: articulabilityRolloutStatusSchema,
  checks: z.array(articulabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ArticulabilityRolloutResponse = z.infer<
  typeof articulabilityRolloutResponseSchema
>

export function getArticulabilityRolloutGuidance() {
  return 'Production articulability rollout validates artifact articulability, workflow articulability signals, billing notification coverage, and articulation readiness before production articulability tooling.'
}
