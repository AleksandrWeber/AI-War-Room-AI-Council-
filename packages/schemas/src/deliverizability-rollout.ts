import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deliverizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeliverizabilityRolloutCheckStatus = z.infer<
  typeof deliverizabilityRolloutCheckStatusSchema
>

export const deliverizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deliverizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeliverizabilityRolloutCheck = z.infer<typeof deliverizabilityRolloutCheckSchema>

export const deliverizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeliverizabilityRolloutStatus = z.infer<typeof deliverizabilityRolloutStatusSchema>

export const deliverizabilityCapabilitiesResponseSchema = z.object({
  supportsDeliverizabilityRollout: z.literal(true),
  supportsDeliverizabilityAdminTools: z.literal(true),
  supportsProviderCredentialDeliverizabilitySignals: z.literal(true),
  supportsModelRegistryDeliverizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeliverizabilityCapabilitiesResponse = z.infer<
  typeof deliverizabilityCapabilitiesResponseSchema
>

export const deliverizabilityRolloutResponseSchema = z.object({
  status: deliverizabilityRolloutStatusSchema,
  checks: z.array(deliverizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeliverizabilityRolloutResponse = z.infer<
  typeof deliverizabilityRolloutResponseSchema
>

export function getDeliverizabilityRolloutGuidance() {
  return 'Production deliverizability rollout validates provider credential deliverizability, model registry deliverizability signals, billing webhook coverage, and deliverization readiness before production deliverizability tooling.'
}
