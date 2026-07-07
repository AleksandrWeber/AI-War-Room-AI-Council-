import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const registryjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegistryjournalizabilityRolloutCheckStatus = z.infer<
  typeof registryjournalizabilityRolloutCheckStatusSchema
>

export const registryjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: registryjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegistryjournalizabilityRolloutCheck = z.infer<typeof registryjournalizabilityRolloutCheckSchema>

export const registryjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegistryjournalizabilityRolloutStatus = z.infer<typeof registryjournalizabilityRolloutStatusSchema>

export const registryjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsRegistryjournalizabilityRollout: z.literal(true),
  supportsRegistryjournalizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRegistryjournalizabilitySignals: z.literal(true),
  supportsBillingRecordRegistryjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegistryjournalizabilityCapabilitiesResponse = z.infer<
  typeof registryjournalizabilityCapabilitiesResponseSchema
>

export const registryjournalizabilityRolloutResponseSchema = z.object({
  status: registryjournalizabilityRolloutStatusSchema,
  checks: z.array(registryjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegistryjournalizabilityRolloutResponse = z.infer<
  typeof registryjournalizabilityRolloutResponseSchema
>

export function getRegistryjournalizabilityRolloutGuidance() {
  return 'Production registryjournalizability rollout validates billing invoice registryjournalizability, billing record registryjournalizability signals, billing webhook coverage, and scalingization readiness before production registryjournalizability tooling.'
}
