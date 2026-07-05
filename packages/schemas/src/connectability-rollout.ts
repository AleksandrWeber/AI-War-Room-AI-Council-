import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const connectabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConnectabilityRolloutCheckStatus = z.infer<
  typeof connectabilityRolloutCheckStatusSchema
>

export const connectabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: connectabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConnectabilityRolloutCheck = z.infer<typeof connectabilityRolloutCheckSchema>

export const connectabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConnectabilityRolloutStatus = z.infer<typeof connectabilityRolloutStatusSchema>

export const connectabilityCapabilitiesResponseSchema = z.object({
  supportsConnectabilityRollout: z.literal(true),
  supportsConnectabilityAdminTools: z.literal(true),
  supportsUsageEventConnectabilitySignals: z.literal(true),
  supportsBillingWebhookConnectabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConnectabilityCapabilitiesResponse = z.infer<
  typeof connectabilityCapabilitiesResponseSchema
>

export const connectabilityRolloutResponseSchema = z.object({
  status: connectabilityRolloutStatusSchema,
  checks: z.array(connectabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConnectabilityRolloutResponse = z.infer<
  typeof connectabilityRolloutResponseSchema
>

export function getConnectabilityRolloutGuidance() {
  return 'Production connectability rollout validates usage event connectability, billing webhook connectability signals, provider credential coverage, and connection readiness before production connectability tooling.'
}
