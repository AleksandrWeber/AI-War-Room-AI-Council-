import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const channelizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ChannelizabilityRolloutCheckStatus = z.infer<
  typeof channelizabilityRolloutCheckStatusSchema
>

export const channelizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: channelizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ChannelizabilityRolloutCheck = z.infer<typeof channelizabilityRolloutCheckSchema>

export const channelizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ChannelizabilityRolloutStatus = z.infer<typeof channelizabilityRolloutStatusSchema>

export const channelizabilityCapabilitiesResponseSchema = z.object({
  supportsChannelizabilityRollout: z.literal(true),
  supportsChannelizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceChannelizabilitySignals: z.literal(true),
  supportsBillingRecordChannelizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ChannelizabilityCapabilitiesResponse = z.infer<
  typeof channelizabilityCapabilitiesResponseSchema
>

export const channelizabilityRolloutResponseSchema = z.object({
  status: channelizabilityRolloutStatusSchema,
  checks: z.array(channelizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ChannelizabilityRolloutResponse = z.infer<
  typeof channelizabilityRolloutResponseSchema
>

export function getChannelizabilityRolloutGuidance() {
  return 'Production channelizability rollout validates billing invoice channelizability, billing record channelizability signals, billing webhook coverage, and channelization readiness before production channelizability tooling.'
}
