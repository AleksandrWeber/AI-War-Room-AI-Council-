import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const bufferizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BufferizabilityRolloutCheckStatus = z.infer<
  typeof bufferizabilityRolloutCheckStatusSchema
>

export const bufferizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: bufferizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BufferizabilityRolloutCheck = z.infer<typeof bufferizabilityRolloutCheckSchema>

export const bufferizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BufferizabilityRolloutStatus = z.infer<typeof bufferizabilityRolloutStatusSchema>

export const bufferizabilityCapabilitiesResponseSchema = z.object({
  supportsBufferizabilityRollout: z.literal(true),
  supportsBufferizabilityAdminTools: z.literal(true),
  supportsShieldScanBufferizabilitySignals: z.literal(true),
  supportsProviderCredentialBufferizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BufferizabilityCapabilitiesResponse = z.infer<
  typeof bufferizabilityCapabilitiesResponseSchema
>

export const bufferizabilityRolloutResponseSchema = z.object({
  status: bufferizabilityRolloutStatusSchema,
  checks: z.array(bufferizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BufferizabilityRolloutResponse = z.infer<
  typeof bufferizabilityRolloutResponseSchema
>

export function getBufferizabilityRolloutGuidance() {
  return 'Production bufferizability rollout validates shield scan bufferizability, provider credential bufferizability signals, billing webhook coverage, and bufferization readiness before production bufferizability tooling.'
}
