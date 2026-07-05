import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const broadcastizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BroadcastizabilityRolloutCheckStatus = z.infer<
  typeof broadcastizabilityRolloutCheckStatusSchema
>

export const broadcastizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: broadcastizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BroadcastizabilityRolloutCheck = z.infer<typeof broadcastizabilityRolloutCheckSchema>

export const broadcastizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BroadcastizabilityRolloutStatus = z.infer<typeof broadcastizabilityRolloutStatusSchema>

export const broadcastizabilityCapabilitiesResponseSchema = z.object({
  supportsBroadcastizabilityRollout: z.literal(true),
  supportsBroadcastizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceBroadcastizabilitySignals: z.literal(true),
  supportsBillingRecordBroadcastizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BroadcastizabilityCapabilitiesResponse = z.infer<
  typeof broadcastizabilityCapabilitiesResponseSchema
>

export const broadcastizabilityRolloutResponseSchema = z.object({
  status: broadcastizabilityRolloutStatusSchema,
  checks: z.array(broadcastizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BroadcastizabilityRolloutResponse = z.infer<
  typeof broadcastizabilityRolloutResponseSchema
>

export function getBroadcastizabilityRolloutGuidance() {
  return 'Production broadcastizability rollout validates billing invoice broadcastizability, billing record broadcastizability signals, billing webhook coverage, and broadcastization readiness before production broadcastizability tooling.'
}
