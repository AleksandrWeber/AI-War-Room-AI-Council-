import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const elaboratabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ElaboratabilityRolloutCheckStatus = z.infer<
  typeof elaboratabilityRolloutCheckStatusSchema
>

export const elaboratabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: elaboratabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ElaboratabilityRolloutCheck = z.infer<typeof elaboratabilityRolloutCheckSchema>

export const elaboratabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ElaboratabilityRolloutStatus = z.infer<typeof elaboratabilityRolloutStatusSchema>

export const elaboratabilityCapabilitiesResponseSchema = z.object({
  supportsElaboratabilityRollout: z.literal(true),
  supportsElaboratabilityAdminTools: z.literal(true),
  supportsWorkflowElaboratabilitySignals: z.literal(true),
  supportsAgentOutputElaboratabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ElaboratabilityCapabilitiesResponse = z.infer<
  typeof elaboratabilityCapabilitiesResponseSchema
>

export const elaboratabilityRolloutResponseSchema = z.object({
  status: elaboratabilityRolloutStatusSchema,
  checks: z.array(elaboratabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ElaboratabilityRolloutResponse = z.infer<
  typeof elaboratabilityRolloutResponseSchema
>

export function getElaboratabilityRolloutGuidance() {
  return 'Production elaboratability rollout validates workflow elaboratability, agent output elaboratability signals, synthesis coverage, and elaboration readiness before production elaboratability tooling.'
}
