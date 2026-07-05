import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const coherenceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CoherenceRolloutCheckStatus = z.infer<
  typeof coherenceRolloutCheckStatusSchema
>

export const coherenceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: coherenceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CoherenceRolloutCheck = z.infer<typeof coherenceRolloutCheckSchema>

export const coherenceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CoherenceRolloutStatus = z.infer<typeof coherenceRolloutStatusSchema>

export const coherenceCapabilitiesResponseSchema = z.object({
  supportsCoherenceRollout: z.literal(true),
  supportsCoherenceAdminTools: z.literal(true),
  supportsWorkflowCoherenceSignals: z.literal(true),
  supportsAgentOutputCoherenceSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CoherenceCapabilitiesResponse = z.infer<
  typeof coherenceCapabilitiesResponseSchema
>

export const coherenceRolloutResponseSchema = z.object({
  status: coherenceRolloutStatusSchema,
  checks: z.array(coherenceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CoherenceRolloutResponse = z.infer<
  typeof coherenceRolloutResponseSchema
>

export function getCoherenceRolloutGuidance() {
  return 'Production coherence rollout validates workflow coherence, agent output coherence signals, synthesis coverage, and coherence readiness before production coherence tooling.'
}
