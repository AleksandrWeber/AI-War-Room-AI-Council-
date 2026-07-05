import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const metaphorizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MetaphorizabilityRolloutCheckStatus = z.infer<
  typeof metaphorizabilityRolloutCheckStatusSchema
>

export const metaphorizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: metaphorizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MetaphorizabilityRolloutCheck = z.infer<typeof metaphorizabilityRolloutCheckSchema>

export const metaphorizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MetaphorizabilityRolloutStatus = z.infer<typeof metaphorizabilityRolloutStatusSchema>

export const metaphorizabilityCapabilitiesResponseSchema = z.object({
  supportsMetaphorizabilityRollout: z.literal(true),
  supportsMetaphorizabilityAdminTools: z.literal(true),
  supportsProviderCredentialMetaphorizabilitySignals: z.literal(true),
  supportsModelRegistryMetaphorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MetaphorizabilityCapabilitiesResponse = z.infer<
  typeof metaphorizabilityCapabilitiesResponseSchema
>

export const metaphorizabilityRolloutResponseSchema = z.object({
  status: metaphorizabilityRolloutStatusSchema,
  checks: z.array(metaphorizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MetaphorizabilityRolloutResponse = z.infer<
  typeof metaphorizabilityRolloutResponseSchema
>

export function getMetaphorizabilityRolloutGuidance() {
  return 'Production metaphorizability rollout validates provider credential metaphorizability, model registry metaphorizability signals, billing webhook coverage, and metaphorization readiness before production metaphorizability tooling.'
}
