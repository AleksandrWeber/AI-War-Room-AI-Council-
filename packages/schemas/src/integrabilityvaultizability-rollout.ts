import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const integrabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntegrabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof integrabilityvaultizabilityRolloutCheckStatusSchema
>

export const integrabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: integrabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntegrabilityvaultizabilityRolloutCheck = z.infer<typeof integrabilityvaultizabilityRolloutCheckSchema>

export const integrabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntegrabilityvaultizabilityRolloutStatus = z.infer<typeof integrabilityvaultizabilityRolloutStatusSchema>

export const integrabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsIntegrabilityvaultizabilityRollout: z.literal(true),
  supportsIntegrabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationIntegrabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookIntegrabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntegrabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof integrabilityvaultizabilityCapabilitiesResponseSchema
>

export const integrabilityvaultizabilityRolloutResponseSchema = z.object({
  status: integrabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(integrabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntegrabilityvaultizabilityRolloutResponse = z.infer<
  typeof integrabilityvaultizabilityRolloutResponseSchema
>

export function getIntegrabilityvaultizabilityRolloutGuidance() {
  return 'Production integrabilityvaultizability rollout validates billing notification integrabilityvaultizability, billing webhook integrabilityvaultizability signals, usage event coverage, and governanceization readiness before production integrabilityvaultizability tooling.'
}
