import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const trustworthinessvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TrustworthinessvaultizabilityRolloutCheckStatus = z.infer<
  typeof trustworthinessvaultizabilityRolloutCheckStatusSchema
>

export const trustworthinessvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: trustworthinessvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TrustworthinessvaultizabilityRolloutCheck = z.infer<typeof trustworthinessvaultizabilityRolloutCheckSchema>

export const trustworthinessvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TrustworthinessvaultizabilityRolloutStatus = z.infer<typeof trustworthinessvaultizabilityRolloutStatusSchema>

export const trustworthinessvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsTrustworthinessvaultizabilityRollout: z.literal(true),
  supportsTrustworthinessvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTrustworthinessvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookTrustworthinessvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TrustworthinessvaultizabilityCapabilitiesResponse = z.infer<
  typeof trustworthinessvaultizabilityCapabilitiesResponseSchema
>

export const trustworthinessvaultizabilityRolloutResponseSchema = z.object({
  status: trustworthinessvaultizabilityRolloutStatusSchema,
  checks: z.array(trustworthinessvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TrustworthinessvaultizabilityRolloutResponse = z.infer<
  typeof trustworthinessvaultizabilityRolloutResponseSchema
>

export function getTrustworthinessvaultizabilityRolloutGuidance() {
  return 'Production trustworthinessvaultizability rollout validates billing notification trustworthinessvaultizability, billing webhook trustworthinessvaultizability signals, usage event coverage, and governanceization readiness before production trustworthinessvaultizability tooling.'
}
