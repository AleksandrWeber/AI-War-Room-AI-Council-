import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const modifiabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ModifiabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof modifiabilityvaultizabilityRolloutCheckStatusSchema
>

export const modifiabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: modifiabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ModifiabilityvaultizabilityRolloutCheck = z.infer<typeof modifiabilityvaultizabilityRolloutCheckSchema>

export const modifiabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ModifiabilityvaultizabilityRolloutStatus = z.infer<typeof modifiabilityvaultizabilityRolloutStatusSchema>

export const modifiabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsModifiabilityvaultizabilityRollout: z.literal(true),
  supportsModifiabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationModifiabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookModifiabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ModifiabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof modifiabilityvaultizabilityCapabilitiesResponseSchema
>

export const modifiabilityvaultizabilityRolloutResponseSchema = z.object({
  status: modifiabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(modifiabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ModifiabilityvaultizabilityRolloutResponse = z.infer<
  typeof modifiabilityvaultizabilityRolloutResponseSchema
>

export function getModifiabilityvaultizabilityRolloutGuidance() {
  return 'Production modifiabilityvaultizability rollout validates billing notification modifiabilityvaultizability, billing webhook modifiabilityvaultizability signals, usage event coverage, and governanceization readiness before production modifiabilityvaultizability tooling.'
}
