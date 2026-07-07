import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reviewabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReviewabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof reviewabilityvaultizabilityRolloutCheckStatusSchema
>

export const reviewabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reviewabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReviewabilityvaultizabilityRolloutCheck = z.infer<typeof reviewabilityvaultizabilityRolloutCheckSchema>

export const reviewabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReviewabilityvaultizabilityRolloutStatus = z.infer<typeof reviewabilityvaultizabilityRolloutStatusSchema>

export const reviewabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsReviewabilityvaultizabilityRollout: z.literal(true),
  supportsReviewabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationReviewabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookReviewabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReviewabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof reviewabilityvaultizabilityCapabilitiesResponseSchema
>

export const reviewabilityvaultizabilityRolloutResponseSchema = z.object({
  status: reviewabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(reviewabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReviewabilityvaultizabilityRolloutResponse = z.infer<
  typeof reviewabilityvaultizabilityRolloutResponseSchema
>

export function getReviewabilityvaultizabilityRolloutGuidance() {
  return 'Production reviewabilityvaultizability rollout validates billing notification reviewabilityvaultizability, billing webhook reviewabilityvaultizability signals, usage event coverage, and governanceization readiness before production reviewabilityvaultizability tooling.'
}
