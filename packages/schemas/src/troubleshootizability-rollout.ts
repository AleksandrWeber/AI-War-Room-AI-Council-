import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const troubleshootizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TroubleshootizabilityRolloutCheckStatus = z.infer<
  typeof troubleshootizabilityRolloutCheckStatusSchema
>

export const troubleshootizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: troubleshootizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TroubleshootizabilityRolloutCheck = z.infer<typeof troubleshootizabilityRolloutCheckSchema>

export const troubleshootizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TroubleshootizabilityRolloutStatus = z.infer<typeof troubleshootizabilityRolloutStatusSchema>

export const troubleshootizabilityCapabilitiesResponseSchema = z.object({
  supportsTroubleshootizabilityRollout: z.literal(true),
  supportsTroubleshootizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTroubleshootizabilitySignals: z.literal(true),
  supportsBillingWebhookTroubleshootizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TroubleshootizabilityCapabilitiesResponse = z.infer<
  typeof troubleshootizabilityCapabilitiesResponseSchema
>

export const troubleshootizabilityRolloutResponseSchema = z.object({
  status: troubleshootizabilityRolloutStatusSchema,
  checks: z.array(troubleshootizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TroubleshootizabilityRolloutResponse = z.infer<
  typeof troubleshootizabilityRolloutResponseSchema
>

export function getTroubleshootizabilityRolloutGuidance() {
  return 'Production troubleshootizability rollout validates billing notification troubleshootizability, billing webhook troubleshootizability signals, usage event coverage, and troubleshootization readiness before production troubleshootizability tooling.'
}
