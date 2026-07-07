import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const integrityjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntegrityjournalizabilityRolloutCheckStatus = z.infer<
  typeof integrityjournalizabilityRolloutCheckStatusSchema
>

export const integrityjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: integrityjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntegrityjournalizabilityRolloutCheck = z.infer<typeof integrityjournalizabilityRolloutCheckSchema>

export const integrityjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntegrityjournalizabilityRolloutStatus = z.infer<typeof integrityjournalizabilityRolloutStatusSchema>

export const integrityjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsIntegrityjournalizabilityRollout: z.literal(true),
  supportsIntegrityjournalizabilityAdminTools: z.literal(true),
  supportsBillingNotificationIntegrityjournalizabilitySignals: z.literal(true),
  supportsBillingWebhookIntegrityjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntegrityjournalizabilityCapabilitiesResponse = z.infer<
  typeof integrityjournalizabilityCapabilitiesResponseSchema
>

export const integrityjournalizabilityRolloutResponseSchema = z.object({
  status: integrityjournalizabilityRolloutStatusSchema,
  checks: z.array(integrityjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntegrityjournalizabilityRolloutResponse = z.infer<
  typeof integrityjournalizabilityRolloutResponseSchema
>

export function getIntegrityjournalizabilityRolloutGuidance() {
  return 'Production integrityjournalizability rollout validates billing notification integrityjournalizability, billing webhook integrityjournalizability signals, usage event coverage, and governanceization readiness before production integrityjournalizability tooling.'
}
