import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const asynchronizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AsynchronizabilityRolloutCheckStatus = z.infer<
  typeof asynchronizabilityRolloutCheckStatusSchema
>

export const asynchronizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: asynchronizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AsynchronizabilityRolloutCheck = z.infer<typeof asynchronizabilityRolloutCheckSchema>

export const asynchronizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AsynchronizabilityRolloutStatus = z.infer<typeof asynchronizabilityRolloutStatusSchema>

export const asynchronizabilityCapabilitiesResponseSchema = z.object({
  supportsAsynchronizabilityRollout: z.literal(true),
  supportsAsynchronizabilityAdminTools: z.literal(true),
  supportsMembershipAsynchronizabilitySignals: z.literal(true),
  supportsUsageEventAsynchronizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AsynchronizabilityCapabilitiesResponse = z.infer<
  typeof asynchronizabilityCapabilitiesResponseSchema
>

export const asynchronizabilityRolloutResponseSchema = z.object({
  status: asynchronizabilityRolloutStatusSchema,
  checks: z.array(asynchronizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AsynchronizabilityRolloutResponse = z.infer<
  typeof asynchronizabilityRolloutResponseSchema
>

export function getAsynchronizabilityRolloutGuidance() {
  return 'Production asynchronizability rollout validates membership asynchronizability, usage event asynchronizability signals, billing notification coverage, and asynchronization readiness before production asynchronizability tooling.'
}
