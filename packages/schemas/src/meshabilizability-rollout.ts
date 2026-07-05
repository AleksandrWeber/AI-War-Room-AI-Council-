import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const meshabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MeshabilizabilityRolloutCheckStatus = z.infer<
  typeof meshabilizabilityRolloutCheckStatusSchema
>

export const meshabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: meshabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MeshabilizabilityRolloutCheck = z.infer<typeof meshabilizabilityRolloutCheckSchema>

export const meshabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MeshabilizabilityRolloutStatus = z.infer<typeof meshabilizabilityRolloutStatusSchema>

export const meshabilizabilityCapabilitiesResponseSchema = z.object({
  supportsMeshabilizabilityRollout: z.literal(true),
  supportsMeshabilizabilityAdminTools: z.literal(true),
  supportsModelHealthMeshabilizabilitySignals: z.literal(true),
  supportsModelRegistryMeshabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MeshabilizabilityCapabilitiesResponse = z.infer<
  typeof meshabilizabilityCapabilitiesResponseSchema
>

export const meshabilizabilityRolloutResponseSchema = z.object({
  status: meshabilizabilityRolloutStatusSchema,
  checks: z.array(meshabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MeshabilizabilityRolloutResponse = z.infer<
  typeof meshabilizabilityRolloutResponseSchema
>

export function getMeshabilizabilityRolloutGuidance() {
  return 'Production meshabilizability rollout validates model health meshabilizability, model registry meshabilizability signals, billing record coverage, and optimization readiness before production meshabilizability tooling.'
}
