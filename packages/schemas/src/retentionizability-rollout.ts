import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const retentionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RetentionizabilityRolloutCheckStatus = z.infer<
  typeof retentionizabilityRolloutCheckStatusSchema
>

export const retentionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: retentionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RetentionizabilityRolloutCheck = z.infer<typeof retentionizabilityRolloutCheckSchema>

export const retentionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RetentionizabilityRolloutStatus = z.infer<typeof retentionizabilityRolloutStatusSchema>

export const retentionizabilityCapabilitiesResponseSchema = z.object({
  supportsRetentionizabilityRollout: z.literal(true),
  supportsRetentionizabilityAdminTools: z.literal(true),
  supportsBillingNotificationRetentionizabilitySignals: z.literal(true),
  supportsBillingWebhookRetentionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RetentionizabilityCapabilitiesResponse = z.infer<
  typeof retentionizabilityCapabilitiesResponseSchema
>

export const retentionizabilityRolloutResponseSchema = z.object({
  status: retentionizabilityRolloutStatusSchema,
  checks: z.array(retentionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RetentionizabilityRolloutResponse = z.infer<
  typeof retentionizabilityRolloutResponseSchema
>

export function getRetentionizabilityRolloutGuidance() {
  return 'Production retentionizability rollout validates billing notification retentionizability, billing webhook retentionizability signals, usage event coverage, and retentionization readiness before production retentionizability tooling.'
}
