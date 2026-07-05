import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const recoveryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RecoveryizabilityRolloutCheckStatus = z.infer<
  typeof recoveryizabilityRolloutCheckStatusSchema
>

export const recoveryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: recoveryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RecoveryizabilityRolloutCheck = z.infer<typeof recoveryizabilityRolloutCheckSchema>

export const recoveryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RecoveryizabilityRolloutStatus = z.infer<typeof recoveryizabilityRolloutStatusSchema>

export const recoveryizabilityCapabilitiesResponseSchema = z.object({
  supportsRecoveryizabilityRollout: z.literal(true),
  supportsRecoveryizabilityAdminTools: z.literal(true),
  supportsBillingNotificationRecoveryizabilitySignals: z.literal(true),
  supportsBillingWebhookRecoveryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RecoveryizabilityCapabilitiesResponse = z.infer<
  typeof recoveryizabilityCapabilitiesResponseSchema
>

export const recoveryizabilityRolloutResponseSchema = z.object({
  status: recoveryizabilityRolloutStatusSchema,
  checks: z.array(recoveryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RecoveryizabilityRolloutResponse = z.infer<
  typeof recoveryizabilityRolloutResponseSchema
>

export function getRecoveryizabilityRolloutGuidance() {
  return 'Production recoveryizability rollout validates billing notification recoveryizability, billing webhook recoveryizability signals, usage event coverage, and recoveryization readiness before production recoveryizability tooling.'
}
