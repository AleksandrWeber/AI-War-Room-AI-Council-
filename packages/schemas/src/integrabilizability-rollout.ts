import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const integrabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntegrabilizabilityRolloutCheckStatus = z.infer<
  typeof integrabilizabilityRolloutCheckStatusSchema
>

export const integrabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: integrabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntegrabilizabilityRolloutCheck = z.infer<typeof integrabilizabilityRolloutCheckSchema>

export const integrabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntegrabilizabilityRolloutStatus = z.infer<typeof integrabilizabilityRolloutStatusSchema>

export const integrabilizabilityCapabilitiesResponseSchema = z.object({
  supportsIntegrabilizabilityRollout: z.literal(true),
  supportsIntegrabilizabilityAdminTools: z.literal(true),
  supportsShieldScanIntegrabilizabilitySignals: z.literal(true),
  supportsProviderCredentialIntegrabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntegrabilizabilityCapabilitiesResponse = z.infer<
  typeof integrabilizabilityCapabilitiesResponseSchema
>

export const integrabilizabilityRolloutResponseSchema = z.object({
  status: integrabilizabilityRolloutStatusSchema,
  checks: z.array(integrabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntegrabilizabilityRolloutResponse = z.infer<
  typeof integrabilizabilityRolloutResponseSchema
>

export function getIntegrabilizabilityRolloutGuidance() {
  return 'Production integrabilizability rollout validates shield scan integrabilizability, provider credential integrabilizability signals, billing webhook coverage, and integrabilization readiness before production integrabilizability tooling.'
}
