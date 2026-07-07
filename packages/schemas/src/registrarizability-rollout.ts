import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const registrarizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RegistrarizabilityRolloutCheckStatus = z.infer<
  typeof registrarizabilityRolloutCheckStatusSchema
>

export const registrarizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: registrarizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RegistrarizabilityRolloutCheck = z.infer<typeof registrarizabilityRolloutCheckSchema>

export const registrarizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RegistrarizabilityRolloutStatus = z.infer<typeof registrarizabilityRolloutStatusSchema>

export const registrarizabilityCapabilitiesResponseSchema = z.object({
  supportsRegistrarizabilityRollout: z.literal(true),
  supportsRegistrarizabilityAdminTools: z.literal(true),
  supportsShieldScanRegistrarizabilitySignals: z.literal(true),
  supportsProviderCredentialRegistrarizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RegistrarizabilityCapabilitiesResponse = z.infer<
  typeof registrarizabilityCapabilitiesResponseSchema
>

export const registrarizabilityRolloutResponseSchema = z.object({
  status: registrarizabilityRolloutStatusSchema,
  checks: z.array(registrarizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RegistrarizabilityRolloutResponse = z.infer<
  typeof registrarizabilityRolloutResponseSchema
>

export function getRegistrarizabilityRolloutGuidance() {
  return 'Production registrarizability rollout validates shield scan registrarizability, provider credential registrarizability signals, billing webhook coverage, and reconciliationization readiness before production registrarizability tooling.'
}
