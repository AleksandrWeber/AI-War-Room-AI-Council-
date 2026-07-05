import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const eventizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EventizabilityRolloutCheckStatus = z.infer<
  typeof eventizabilityRolloutCheckStatusSchema
>

export const eventizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: eventizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EventizabilityRolloutCheck = z.infer<typeof eventizabilityRolloutCheckSchema>

export const eventizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EventizabilityRolloutStatus = z.infer<typeof eventizabilityRolloutStatusSchema>

export const eventizabilityCapabilitiesResponseSchema = z.object({
  supportsEventizabilityRollout: z.literal(true),
  supportsEventizabilityAdminTools: z.literal(true),
  supportsMembershipEventizabilitySignals: z.literal(true),
  supportsUsageEventEventizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EventizabilityCapabilitiesResponse = z.infer<
  typeof eventizabilityCapabilitiesResponseSchema
>

export const eventizabilityRolloutResponseSchema = z.object({
  status: eventizabilityRolloutStatusSchema,
  checks: z.array(eventizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EventizabilityRolloutResponse = z.infer<
  typeof eventizabilityRolloutResponseSchema
>

export function getEventizabilityRolloutGuidance() {
  return 'Production eventizability rollout validates membership eventizability, usage event eventizability signals, billing notification coverage, and eventization readiness before production eventizability tooling.'
}
