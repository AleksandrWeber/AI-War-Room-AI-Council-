import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const orderingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OrderingizabilityRolloutCheckStatus = z.infer<
  typeof orderingizabilityRolloutCheckStatusSchema
>

export const orderingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: orderingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OrderingizabilityRolloutCheck = z.infer<typeof orderingizabilityRolloutCheckSchema>

export const orderingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OrderingizabilityRolloutStatus = z.infer<typeof orderingizabilityRolloutStatusSchema>

export const orderingizabilityCapabilitiesResponseSchema = z.object({
  supportsOrderingizabilityRollout: z.literal(true),
  supportsOrderingizabilityAdminTools: z.literal(true),
  supportsMembershipOrderingizabilitySignals: z.literal(true),
  supportsUsageEventOrderingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OrderingizabilityCapabilitiesResponse = z.infer<
  typeof orderingizabilityCapabilitiesResponseSchema
>

export const orderingizabilityRolloutResponseSchema = z.object({
  status: orderingizabilityRolloutStatusSchema,
  checks: z.array(orderingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OrderingizabilityRolloutResponse = z.infer<
  typeof orderingizabilityRolloutResponseSchema
>

export function getOrderingizabilityRolloutGuidance() {
  return 'Production orderingizability rollout validates membership orderingizability, usage event orderingizability signals, billing notification coverage, and orderingization readiness before production orderingizability tooling.'
}
