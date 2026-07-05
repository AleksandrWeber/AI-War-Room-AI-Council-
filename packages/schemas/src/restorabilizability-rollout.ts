import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const restorabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RestorabilizabilityRolloutCheckStatus = z.infer<
  typeof restorabilizabilityRolloutCheckStatusSchema
>

export const restorabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: restorabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RestorabilizabilityRolloutCheck = z.infer<typeof restorabilizabilityRolloutCheckSchema>

export const restorabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RestorabilizabilityRolloutStatus = z.infer<typeof restorabilizabilityRolloutStatusSchema>

export const restorabilizabilityCapabilitiesResponseSchema = z.object({
  supportsRestorabilizabilityRollout: z.literal(true),
  supportsRestorabilizabilityAdminTools: z.literal(true),
  supportsBillingWebhookRestorabilizabilitySignals: z.literal(true),
  supportsBillingRecordRestorabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RestorabilizabilityCapabilitiesResponse = z.infer<
  typeof restorabilizabilityCapabilitiesResponseSchema
>

export const restorabilizabilityRolloutResponseSchema = z.object({
  status: restorabilizabilityRolloutStatusSchema,
  checks: z.array(restorabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RestorabilizabilityRolloutResponse = z.infer<
  typeof restorabilizabilityRolloutResponseSchema
>

export function getRestorabilizabilityRolloutGuidance() {
  return 'Production restorabilizability rollout validates billing webhook restorabilizability, billing record restorabilizability signals, usage event coverage, and interpolation readiness before production restorabilizability tooling.'
}
