import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const visualizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VisualizabilityRolloutCheckStatus = z.infer<
  typeof visualizabilityRolloutCheckStatusSchema
>

export const visualizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: visualizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VisualizabilityRolloutCheck = z.infer<typeof visualizabilityRolloutCheckSchema>

export const visualizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VisualizabilityRolloutStatus = z.infer<typeof visualizabilityRolloutStatusSchema>

export const visualizabilityCapabilitiesResponseSchema = z.object({
  supportsVisualizabilityRollout: z.literal(true),
  supportsVisualizabilityAdminTools: z.literal(true),
  supportsModelRegistryVisualizabilitySignals: z.literal(true),
  supportsModelHealthVisualizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VisualizabilityCapabilitiesResponse = z.infer<
  typeof visualizabilityCapabilitiesResponseSchema
>

export const visualizabilityRolloutResponseSchema = z.object({
  status: visualizabilityRolloutStatusSchema,
  checks: z.array(visualizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VisualizabilityRolloutResponse = z.infer<
  typeof visualizabilityRolloutResponseSchema
>

export function getVisualizabilityRolloutGuidance() {
  return 'Production visualizability rollout validates model registry visualizability, model health visualizability signals, provider credential coverage, and visualization readiness before production visualizability tooling.'
}
