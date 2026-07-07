import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const telemetryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TelemetryizabilityRolloutCheckStatus = z.infer<
  typeof telemetryizabilityRolloutCheckStatusSchema
>

export const telemetryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: telemetryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TelemetryizabilityRolloutCheck = z.infer<typeof telemetryizabilityRolloutCheckSchema>

export const telemetryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TelemetryizabilityRolloutStatus = z.infer<typeof telemetryizabilityRolloutStatusSchema>

export const telemetryizabilityCapabilitiesResponseSchema = z.object({
  supportsTelemetryizabilityRollout: z.literal(true),
  supportsTelemetryizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTelemetryizabilitySignals: z.literal(true),
  supportsBillingWebhookTelemetryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TelemetryizabilityCapabilitiesResponse = z.infer<
  typeof telemetryizabilityCapabilitiesResponseSchema
>

export const telemetryizabilityRolloutResponseSchema = z.object({
  status: telemetryizabilityRolloutStatusSchema,
  checks: z.array(telemetryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TelemetryizabilityRolloutResponse = z.infer<
  typeof telemetryizabilityRolloutResponseSchema
>

export function getTelemetryizabilityRolloutGuidance() {
  return 'Production telemetryizability rollout validates billing notification telemetryizability, billing webhook telemetryizability signals, usage event coverage, and governanceization readiness before production telemetryizability tooling.'
}
