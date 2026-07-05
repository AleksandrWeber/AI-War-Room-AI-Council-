import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const caracterizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CaracterizabilityRolloutCheckStatus = z.infer<
  typeof caracterizabilityRolloutCheckStatusSchema
>

export const caracterizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: caracterizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CaracterizabilityRolloutCheck = z.infer<typeof caracterizabilityRolloutCheckSchema>

export const caracterizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CaracterizabilityRolloutStatus = z.infer<typeof caracterizabilityRolloutStatusSchema>

export const caracterizabilityCapabilitiesResponseSchema = z.object({
  supportsCaracterizabilityRollout: z.literal(true),
  supportsCaracterizabilityAdminTools: z.literal(true),
  supportsWorkflowCaracterizabilitySignals: z.literal(true),
  supportsAgentOutputCaracterizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CaracterizabilityCapabilitiesResponse = z.infer<
  typeof caracterizabilityCapabilitiesResponseSchema
>

export const caracterizabilityRolloutResponseSchema = z.object({
  status: caracterizabilityRolloutStatusSchema,
  checks: z.array(caracterizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CaracterizabilityRolloutResponse = z.infer<
  typeof caracterizabilityRolloutResponseSchema
>

export function getCaracterizabilityRolloutGuidance() {
  return 'Production caracterizability rollout validates workflow caracterizability, agent output caracterizability signals, synthesis coverage, and characterization readiness before production caracterizability tooling.'
}
