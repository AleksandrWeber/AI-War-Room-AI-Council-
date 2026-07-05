import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const teleologizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TeleologizabilityRolloutCheckStatus = z.infer<
  typeof teleologizabilityRolloutCheckStatusSchema
>

export const teleologizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: teleologizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TeleologizabilityRolloutCheck = z.infer<typeof teleologizabilityRolloutCheckSchema>

export const teleologizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TeleologizabilityRolloutStatus = z.infer<typeof teleologizabilityRolloutStatusSchema>

export const teleologizabilityCapabilitiesResponseSchema = z.object({
  supportsTeleologizabilityRollout: z.literal(true),
  supportsTeleologizabilityAdminTools: z.literal(true),
  supportsBillingWebhookTeleologizabilitySignals: z.literal(true),
  supportsBillingRecordTeleologizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TeleologizabilityCapabilitiesResponse = z.infer<
  typeof teleologizabilityCapabilitiesResponseSchema
>

export const teleologizabilityRolloutResponseSchema = z.object({
  status: teleologizabilityRolloutStatusSchema,
  checks: z.array(teleologizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TeleologizabilityRolloutResponse = z.infer<
  typeof teleologizabilityRolloutResponseSchema
>

export function getTeleologizabilityRolloutGuidance() {
  return 'Production teleologizability rollout validates billing webhook teleologizability, billing record teleologizability signals, usage event coverage, and teleologization readiness before production teleologizability tooling.'
}
