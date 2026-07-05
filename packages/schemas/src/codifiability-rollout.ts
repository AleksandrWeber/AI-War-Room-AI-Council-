import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const codifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CodifiabilityRolloutCheckStatus = z.infer<
  typeof codifiabilityRolloutCheckStatusSchema
>

export const codifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: codifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CodifiabilityRolloutCheck = z.infer<typeof codifiabilityRolloutCheckSchema>

export const codifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CodifiabilityRolloutStatus = z.infer<typeof codifiabilityRolloutStatusSchema>

export const codifiabilityCapabilitiesResponseSchema = z.object({
  supportsCodifiabilityRollout: z.literal(true),
  supportsCodifiabilityAdminTools: z.literal(true),
  supportsProviderCredentialCodifiabilitySignals: z.literal(true),
  supportsModelRegistryCodifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CodifiabilityCapabilitiesResponse = z.infer<
  typeof codifiabilityCapabilitiesResponseSchema
>

export const codifiabilityRolloutResponseSchema = z.object({
  status: codifiabilityRolloutStatusSchema,
  checks: z.array(codifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CodifiabilityRolloutResponse = z.infer<
  typeof codifiabilityRolloutResponseSchema
>

export function getCodifiabilityRolloutGuidance() {
  return 'Production codifiability rollout validates provider credential codifiability, model registry codifiability signals, billing webhook coverage, and codification readiness before production codifiability tooling.'
}
