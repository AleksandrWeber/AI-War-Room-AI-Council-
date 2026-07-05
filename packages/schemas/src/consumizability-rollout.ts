import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const consumizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConsumizabilityRolloutCheckStatus = z.infer<
  typeof consumizabilityRolloutCheckStatusSchema
>

export const consumizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: consumizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConsumizabilityRolloutCheck = z.infer<typeof consumizabilityRolloutCheckSchema>

export const consumizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConsumizabilityRolloutStatus = z.infer<typeof consumizabilityRolloutStatusSchema>

export const consumizabilityCapabilitiesResponseSchema = z.object({
  supportsConsumizabilityRollout: z.literal(true),
  supportsConsumizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitConsumizabilitySignals: z.literal(true),
  supportsUsageEventConsumizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConsumizabilityCapabilitiesResponse = z.infer<
  typeof consumizabilityCapabilitiesResponseSchema
>

export const consumizabilityRolloutResponseSchema = z.object({
  status: consumizabilityRolloutStatusSchema,
  checks: z.array(consumizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConsumizabilityRolloutResponse = z.infer<
  typeof consumizabilityRolloutResponseSchema
>

export function getConsumizabilityRolloutGuidance() {
  return 'Production consumizability rollout validates workspace limit consumizability, usage event consumizability signals, billing record coverage, and consumization readiness before production consumizability tooling.'
}
