import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dramatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DramatizabilityRolloutCheckStatus = z.infer<
  typeof dramatizabilityRolloutCheckStatusSchema
>

export const dramatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dramatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DramatizabilityRolloutCheck = z.infer<typeof dramatizabilityRolloutCheckSchema>

export const dramatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DramatizabilityRolloutStatus = z.infer<typeof dramatizabilityRolloutStatusSchema>

export const dramatizabilityCapabilitiesResponseSchema = z.object({
  supportsDramatizabilityRollout: z.literal(true),
  supportsDramatizabilityAdminTools: z.literal(true),
  supportsArtifactDramatizabilitySignals: z.literal(true),
  supportsAgentOutputDramatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DramatizabilityCapabilitiesResponse = z.infer<
  typeof dramatizabilityCapabilitiesResponseSchema
>

export const dramatizabilityRolloutResponseSchema = z.object({
  status: dramatizabilityRolloutStatusSchema,
  checks: z.array(dramatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DramatizabilityRolloutResponse = z.infer<
  typeof dramatizabilityRolloutResponseSchema
>

export function getDramatizabilityRolloutGuidance() {
  return 'Production dramatizability rollout validates artifact dramatizability, agent output dramatizability signals, synthesis coverage, and dramatization readiness before production dramatizability tooling.'
}
