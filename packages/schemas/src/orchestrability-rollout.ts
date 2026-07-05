import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const orchestrabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OrchestrabilityRolloutCheckStatus = z.infer<
  typeof orchestrabilityRolloutCheckStatusSchema
>

export const orchestrabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: orchestrabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OrchestrabilityRolloutCheck = z.infer<typeof orchestrabilityRolloutCheckSchema>

export const orchestrabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OrchestrabilityRolloutStatus = z.infer<typeof orchestrabilityRolloutStatusSchema>

export const orchestrabilityCapabilitiesResponseSchema = z.object({
  supportsOrchestrabilityRollout: z.literal(true),
  supportsOrchestrabilityAdminTools: z.literal(true),
  supportsWorkflowOrchestrabilitySignals: z.literal(true),
  supportsSynthesisOrchestrabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OrchestrabilityCapabilitiesResponse = z.infer<
  typeof orchestrabilityCapabilitiesResponseSchema
>

export const orchestrabilityRolloutResponseSchema = z.object({
  status: orchestrabilityRolloutStatusSchema,
  checks: z.array(orchestrabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OrchestrabilityRolloutResponse = z.infer<
  typeof orchestrabilityRolloutResponseSchema
>

export function getOrchestrabilityRolloutGuidance() {
  return 'Production orchestrability rollout validates workflow orchestrability, synthesis orchestrability signals, billing notification coverage, and orchestration readiness before production orchestrability tooling.'
}
