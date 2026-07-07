import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const explainabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExplainabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof explainabilityvaultizabilityRolloutCheckStatusSchema
>

export const explainabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: explainabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExplainabilityvaultizabilityRolloutCheck = z.infer<typeof explainabilityvaultizabilityRolloutCheckSchema>

export const explainabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExplainabilityvaultizabilityRolloutStatus = z.infer<typeof explainabilityvaultizabilityRolloutStatusSchema>

export const explainabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsExplainabilityvaultizabilityRollout: z.literal(true),
  supportsExplainabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipExplainabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventExplainabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExplainabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof explainabilityvaultizabilityCapabilitiesResponseSchema
>

export const explainabilityvaultizabilityRolloutResponseSchema = z.object({
  status: explainabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(explainabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExplainabilityvaultizabilityRolloutResponse = z.infer<
  typeof explainabilityvaultizabilityRolloutResponseSchema
>

export function getExplainabilityvaultizabilityRolloutGuidance() {
  return 'Production explainabilityvaultizability rollout validates membership explainabilityvaultizability, usage event explainabilityvaultizability signals, billing notification coverage, and healingization readiness before production explainabilityvaultizability tooling.'
}
