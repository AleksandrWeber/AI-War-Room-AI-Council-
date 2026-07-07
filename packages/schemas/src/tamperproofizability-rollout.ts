import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tamperproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TamperproofizabilityRolloutCheckStatus = z.infer<
  typeof tamperproofizabilityRolloutCheckStatusSchema
>

export const tamperproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tamperproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TamperproofizabilityRolloutCheck = z.infer<typeof tamperproofizabilityRolloutCheckSchema>

export const tamperproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TamperproofizabilityRolloutStatus = z.infer<typeof tamperproofizabilityRolloutStatusSchema>

export const tamperproofizabilityCapabilitiesResponseSchema = z.object({
  supportsTamperproofizabilityRollout: z.literal(true),
  supportsTamperproofizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTamperproofizabilitySignals: z.literal(true),
  supportsBillingWebhookTamperproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TamperproofizabilityCapabilitiesResponse = z.infer<
  typeof tamperproofizabilityCapabilitiesResponseSchema
>

export const tamperproofizabilityRolloutResponseSchema = z.object({
  status: tamperproofizabilityRolloutStatusSchema,
  checks: z.array(tamperproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TamperproofizabilityRolloutResponse = z.infer<
  typeof tamperproofizabilityRolloutResponseSchema
>

export function getTamperproofizabilityRolloutGuidance() {
  return 'Production tamperproofizability rollout validates billing notification tamperproofizability, billing webhook tamperproofizability signals, usage event coverage, and governanceization readiness before production tamperproofizability tooling.'
}
