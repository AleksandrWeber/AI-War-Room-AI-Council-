import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const restoreizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RestoreizabilityRolloutCheckStatus = z.infer<
  typeof restoreizabilityRolloutCheckStatusSchema
>

export const restoreizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: restoreizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RestoreizabilityRolloutCheck = z.infer<typeof restoreizabilityRolloutCheckSchema>

export const restoreizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RestoreizabilityRolloutStatus = z.infer<typeof restoreizabilityRolloutStatusSchema>

export const restoreizabilityCapabilitiesResponseSchema = z.object({
  supportsRestoreizabilityRollout: z.literal(true),
  supportsRestoreizabilityAdminTools: z.literal(true),
  supportsBillingWebhookRestoreizabilitySignals: z.literal(true),
  supportsBillingRecordRestoreizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RestoreizabilityCapabilitiesResponse = z.infer<
  typeof restoreizabilityCapabilitiesResponseSchema
>

export const restoreizabilityRolloutResponseSchema = z.object({
  status: restoreizabilityRolloutStatusSchema,
  checks: z.array(restoreizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RestoreizabilityRolloutResponse = z.infer<
  typeof restoreizabilityRolloutResponseSchema
>

export function getRestoreizabilityRolloutGuidance() {
  return 'Production restoreizability rollout validates billing webhook restoreizability, billing record restoreizability signals, usage event coverage, and interpolation readiness before production restoreizability tooling.'
}
