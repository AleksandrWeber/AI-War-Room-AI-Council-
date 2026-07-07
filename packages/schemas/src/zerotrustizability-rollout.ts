import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const zerotrustizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ZerotrustizabilityRolloutCheckStatus = z.infer<
  typeof zerotrustizabilityRolloutCheckStatusSchema
>

export const zerotrustizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: zerotrustizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ZerotrustizabilityRolloutCheck = z.infer<typeof zerotrustizabilityRolloutCheckSchema>

export const zerotrustizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ZerotrustizabilityRolloutStatus = z.infer<typeof zerotrustizabilityRolloutStatusSchema>

export const zerotrustizabilityCapabilitiesResponseSchema = z.object({
  supportsZerotrustizabilityRollout: z.literal(true),
  supportsZerotrustizabilityAdminTools: z.literal(true),
  supportsBillingNotificationZerotrustizabilitySignals: z.literal(true),
  supportsBillingWebhookZerotrustizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ZerotrustizabilityCapabilitiesResponse = z.infer<
  typeof zerotrustizabilityCapabilitiesResponseSchema
>

export const zerotrustizabilityRolloutResponseSchema = z.object({
  status: zerotrustizabilityRolloutStatusSchema,
  checks: z.array(zerotrustizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ZerotrustizabilityRolloutResponse = z.infer<
  typeof zerotrustizabilityRolloutResponseSchema
>

export function getZerotrustizabilityRolloutGuidance() {
  return 'Production zerotrustizability rollout validates billing notification zerotrustizability, billing webhook zerotrustizability signals, usage event coverage, and governanceization readiness before production zerotrustizability tooling.'
}
