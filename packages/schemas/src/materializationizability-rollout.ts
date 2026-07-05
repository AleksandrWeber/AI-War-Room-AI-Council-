import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const materializationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MaterializationizabilityRolloutCheckStatus = z.infer<
  typeof materializationizabilityRolloutCheckStatusSchema
>

export const materializationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: materializationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MaterializationizabilityRolloutCheck = z.infer<typeof materializationizabilityRolloutCheckSchema>

export const materializationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MaterializationizabilityRolloutStatus = z.infer<typeof materializationizabilityRolloutStatusSchema>

export const materializationizabilityCapabilitiesResponseSchema = z.object({
  supportsMaterializationizabilityRollout: z.literal(true),
  supportsMaterializationizabilityAdminTools: z.literal(true),
  supportsModelHealthMaterializationizabilitySignals: z.literal(true),
  supportsModelRegistryMaterializationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MaterializationizabilityCapabilitiesResponse = z.infer<
  typeof materializationizabilityCapabilitiesResponseSchema
>

export const materializationizabilityRolloutResponseSchema = z.object({
  status: materializationizabilityRolloutStatusSchema,
  checks: z.array(materializationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MaterializationizabilityRolloutResponse = z.infer<
  typeof materializationizabilityRolloutResponseSchema
>

export function getMaterializationizabilityRolloutGuidance() {
  return 'Production materializationizability rollout validates model health materializationizability, model registry materializationizability signals, billing record coverage, and optimization readiness before production materializationizability tooling.'
}
