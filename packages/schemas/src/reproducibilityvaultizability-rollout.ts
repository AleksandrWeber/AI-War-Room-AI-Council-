import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const reproducibilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReproducibilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof reproducibilityvaultizabilityRolloutCheckStatusSchema
>

export const reproducibilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: reproducibilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReproducibilityvaultizabilityRolloutCheck = z.infer<typeof reproducibilityvaultizabilityRolloutCheckSchema>

export const reproducibilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReproducibilityvaultizabilityRolloutStatus = z.infer<typeof reproducibilityvaultizabilityRolloutStatusSchema>

export const reproducibilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsReproducibilityvaultizabilityRollout: z.literal(true),
  supportsReproducibilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanReproducibilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialReproducibilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReproducibilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof reproducibilityvaultizabilityCapabilitiesResponseSchema
>

export const reproducibilityvaultizabilityRolloutResponseSchema = z.object({
  status: reproducibilityvaultizabilityRolloutStatusSchema,
  checks: z.array(reproducibilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReproducibilityvaultizabilityRolloutResponse = z.infer<
  typeof reproducibilityvaultizabilityRolloutResponseSchema
>

export function getReproducibilityvaultizabilityRolloutGuidance() {
  return 'Production reproducibilityvaultizability rollout validates shield scan reproducibilityvaultizability, provider credential reproducibilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production reproducibilityvaultizability tooling.'
}
