import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const registryvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegistryvaultizabilityRolloutCheckStatus = z.infer<
  typeof registryvaultizabilityRolloutCheckStatusSchema
>

export const registryvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: registryvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegistryvaultizabilityRolloutCheck = z.infer<typeof registryvaultizabilityRolloutCheckSchema>

export const registryvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegistryvaultizabilityRolloutStatus = z.infer<typeof registryvaultizabilityRolloutStatusSchema>

export const registryvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsRegistryvaultizabilityRollout: z.literal(true),
  supportsRegistryvaultizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRegistryvaultizabilitySignals: z.literal(true),
  supportsBillingRecordRegistryvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegistryvaultizabilityCapabilitiesResponse = z.infer<
  typeof registryvaultizabilityCapabilitiesResponseSchema
>

export const registryvaultizabilityRolloutResponseSchema = z.object({
  status: registryvaultizabilityRolloutStatusSchema,
  checks: z.array(registryvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegistryvaultizabilityRolloutResponse = z.infer<
  typeof registryvaultizabilityRolloutResponseSchema
>

export function getRegistryvaultizabilityRolloutGuidance() {
  return 'Production registryvaultizability rollout validates billing invoice registryvaultizability, billing record registryvaultizability signals, billing webhook coverage, and scalingization readiness before production registryvaultizability tooling.'
}
