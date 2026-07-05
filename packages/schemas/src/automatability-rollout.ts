import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const automatabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AutomatabilityRolloutCheckStatus = z.infer<
  typeof automatabilityRolloutCheckStatusSchema
>

export const automatabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: automatabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AutomatabilityRolloutCheck = z.infer<typeof automatabilityRolloutCheckSchema>

export const automatabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AutomatabilityRolloutStatus = z.infer<typeof automatabilityRolloutStatusSchema>

export const automatabilityCapabilitiesResponseSchema = z.object({
  supportsAutomatabilityRollout: z.literal(true),
  supportsAutomatabilityAdminTools: z.literal(true),
  supportsAgentOutputAutomatabilitySignals: z.literal(true),
  supportsWorkflowAutomatabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AutomatabilityCapabilitiesResponse = z.infer<
  typeof automatabilityCapabilitiesResponseSchema
>

export const automatabilityRolloutResponseSchema = z.object({
  status: automatabilityRolloutStatusSchema,
  checks: z.array(automatabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AutomatabilityRolloutResponse = z.infer<
  typeof automatabilityRolloutResponseSchema
>

export function getAutomatabilityRolloutGuidance() {
  return 'Production automatability rollout validates agent output automatability, workflow automatability signals, artifact coverage, and automation readiness before production automatability tooling.'
}
