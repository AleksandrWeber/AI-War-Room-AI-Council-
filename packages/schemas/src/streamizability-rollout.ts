import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const streamizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type StreamizabilityRolloutCheckStatus = z.infer<
  typeof streamizabilityRolloutCheckStatusSchema
>

export const streamizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: streamizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type StreamizabilityRolloutCheck = z.infer<typeof streamizabilityRolloutCheckSchema>

export const streamizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type StreamizabilityRolloutStatus = z.infer<typeof streamizabilityRolloutStatusSchema>

export const streamizabilityCapabilitiesResponseSchema = z.object({
  supportsStreamizabilityRollout: z.literal(true),
  supportsStreamizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceStreamizabilitySignals: z.literal(true),
  supportsBillingRecordStreamizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type StreamizabilityCapabilitiesResponse = z.infer<
  typeof streamizabilityCapabilitiesResponseSchema
>

export const streamizabilityRolloutResponseSchema = z.object({
  status: streamizabilityRolloutStatusSchema,
  checks: z.array(streamizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type StreamizabilityRolloutResponse = z.infer<
  typeof streamizabilityRolloutResponseSchema
>

export function getStreamizabilityRolloutGuidance() {
  return 'Production streamizability rollout validates billing invoice streamizability, billing record streamizability signals, billing webhook coverage, and streamization readiness before production streamizability tooling.'
}
