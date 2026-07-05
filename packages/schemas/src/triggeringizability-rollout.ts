import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const triggeringizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TriggeringizabilityRolloutCheckStatus = z.infer<
  typeof triggeringizabilityRolloutCheckStatusSchema
>

export const triggeringizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: triggeringizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TriggeringizabilityRolloutCheck = z.infer<typeof triggeringizabilityRolloutCheckSchema>

export const triggeringizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TriggeringizabilityRolloutStatus = z.infer<typeof triggeringizabilityRolloutStatusSchema>

export const triggeringizabilityCapabilitiesResponseSchema = z.object({
  supportsTriggeringizabilityRollout: z.literal(true),
  supportsTriggeringizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitTriggeringizabilitySignals: z.literal(true),
  supportsUsageEventTriggeringizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TriggeringizabilityCapabilitiesResponse = z.infer<
  typeof triggeringizabilityCapabilitiesResponseSchema
>

export const triggeringizabilityRolloutResponseSchema = z.object({
  status: triggeringizabilityRolloutStatusSchema,
  checks: z.array(triggeringizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TriggeringizabilityRolloutResponse = z.infer<
  typeof triggeringizabilityRolloutResponseSchema
>

export function getTriggeringizabilityRolloutGuidance() {
  return 'Production triggeringizability rollout validates workspace limit triggeringizability, usage event triggeringizability signals, billing record coverage, and triggeringization readiness before production triggeringizability tooling.'
}
