import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const credibilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CredibilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof credibilityvaultizabilityRolloutCheckStatusSchema
>

export const credibilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: credibilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CredibilityvaultizabilityRolloutCheck = z.infer<typeof credibilityvaultizabilityRolloutCheckSchema>

export const credibilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CredibilityvaultizabilityRolloutStatus = z.infer<typeof credibilityvaultizabilityRolloutStatusSchema>

export const credibilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsCredibilityvaultizabilityRollout: z.literal(true),
  supportsCredibilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationCredibilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookCredibilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CredibilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof credibilityvaultizabilityCapabilitiesResponseSchema
>

export const credibilityvaultizabilityRolloutResponseSchema = z.object({
  status: credibilityvaultizabilityRolloutStatusSchema,
  checks: z.array(credibilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CredibilityvaultizabilityRolloutResponse = z.infer<
  typeof credibilityvaultizabilityRolloutResponseSchema
>

export function getCredibilityvaultizabilityRolloutGuidance() {
  return 'Production credibilityvaultizability rollout validates billing notification credibilityvaultizability, billing webhook credibilityvaultizability signals, usage event coverage, and governanceization readiness before production credibilityvaultizability tooling.'
}
