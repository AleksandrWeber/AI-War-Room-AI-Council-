import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const witnessproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WitnessproofizabilityRolloutCheckStatus = z.infer<
  typeof witnessproofizabilityRolloutCheckStatusSchema
>

export const witnessproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: witnessproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WitnessproofizabilityRolloutCheck = z.infer<typeof witnessproofizabilityRolloutCheckSchema>

export const witnessproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WitnessproofizabilityRolloutStatus = z.infer<typeof witnessproofizabilityRolloutStatusSchema>

export const witnessproofizabilityCapabilitiesResponseSchema = z.object({
  supportsWitnessproofizabilityRollout: z.literal(true),
  supportsWitnessproofizabilityAdminTools: z.literal(true),
  supportsBillingNotificationWitnessproofizabilitySignals: z.literal(true),
  supportsBillingWebhookWitnessproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WitnessproofizabilityCapabilitiesResponse = z.infer<
  typeof witnessproofizabilityCapabilitiesResponseSchema
>

export const witnessproofizabilityRolloutResponseSchema = z.object({
  status: witnessproofizabilityRolloutStatusSchema,
  checks: z.array(witnessproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WitnessproofizabilityRolloutResponse = z.infer<
  typeof witnessproofizabilityRolloutResponseSchema
>

export function getWitnessproofizabilityRolloutGuidance() {
  return 'Production witnessproofizability rollout validates billing notification witnessproofizability, billing webhook witnessproofizability signals, usage event coverage, and governanceization readiness before production witnessproofizability tooling.'
}
