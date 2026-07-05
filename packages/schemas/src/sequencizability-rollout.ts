import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const sequencizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SequencizabilityRolloutCheckStatus = z.infer<
  typeof sequencizabilityRolloutCheckStatusSchema
>

export const sequencizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: sequencizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SequencizabilityRolloutCheck = z.infer<typeof sequencizabilityRolloutCheckSchema>

export const sequencizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SequencizabilityRolloutStatus = z.infer<typeof sequencizabilityRolloutStatusSchema>

export const sequencizabilityCapabilitiesResponseSchema = z.object({
  supportsSequencizabilityRollout: z.literal(true),
  supportsSequencizabilityAdminTools: z.literal(true),
  supportsModelHealthSequencizabilitySignals: z.literal(true),
  supportsModelRegistrySequencizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SequencizabilityCapabilitiesResponse = z.infer<
  typeof sequencizabilityCapabilitiesResponseSchema
>

export const sequencizabilityRolloutResponseSchema = z.object({
  status: sequencizabilityRolloutStatusSchema,
  checks: z.array(sequencizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SequencizabilityRolloutResponse = z.infer<
  typeof sequencizabilityRolloutResponseSchema
>

export function getSequencizabilityRolloutGuidance() {
  return 'Production sequencizability rollout validates model health sequencizability, model registry sequencizability signals, billing record coverage, and optimization readiness before production sequencizability tooling.'
}
