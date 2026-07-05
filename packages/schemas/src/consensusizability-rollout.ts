import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const consensusizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConsensusizabilityRolloutCheckStatus = z.infer<
  typeof consensusizabilityRolloutCheckStatusSchema
>

export const consensusizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: consensusizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConsensusizabilityRolloutCheck = z.infer<typeof consensusizabilityRolloutCheckSchema>

export const consensusizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConsensusizabilityRolloutStatus = z.infer<typeof consensusizabilityRolloutStatusSchema>

export const consensusizabilityCapabilitiesResponseSchema = z.object({
  supportsConsensusizabilityRollout: z.literal(true),
  supportsConsensusizabilityAdminTools: z.literal(true),
  supportsModelHealthConsensusizabilitySignals: z.literal(true),
  supportsModelRegistryConsensusizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConsensusizabilityCapabilitiesResponse = z.infer<
  typeof consensusizabilityCapabilitiesResponseSchema
>

export const consensusizabilityRolloutResponseSchema = z.object({
  status: consensusizabilityRolloutStatusSchema,
  checks: z.array(consensusizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConsensusizabilityRolloutResponse = z.infer<
  typeof consensusizabilityRolloutResponseSchema
>

export function getConsensusizabilityRolloutGuidance() {
  return 'Production consensusizability rollout validates model health consensusizability, model registry consensusizability signals, billing record coverage, and optimization readiness before production consensusizability tooling.'
}
