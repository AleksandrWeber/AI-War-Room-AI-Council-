import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const navigabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NavigabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof navigabilityvaultizabilityRolloutCheckStatusSchema
>

export const navigabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: navigabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NavigabilityvaultizabilityRolloutCheck = z.infer<typeof navigabilityvaultizabilityRolloutCheckSchema>

export const navigabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NavigabilityvaultizabilityRolloutStatus = z.infer<typeof navigabilityvaultizabilityRolloutStatusSchema>

export const navigabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsNavigabilityvaultizabilityRollout: z.literal(true),
  supportsNavigabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationNavigabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookNavigabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NavigabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof navigabilityvaultizabilityCapabilitiesResponseSchema
>

export const navigabilityvaultizabilityRolloutResponseSchema = z.object({
  status: navigabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(navigabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NavigabilityvaultizabilityRolloutResponse = z.infer<
  typeof navigabilityvaultizabilityRolloutResponseSchema
>

export function getNavigabilityvaultizabilityRolloutGuidance() {
  return 'Production navigabilityvaultizability rollout validates billing notification navigabilityvaultizability, billing webhook navigabilityvaultizability signals, usage event coverage, and governanceization readiness before production navigabilityvaultizability tooling.'
}
