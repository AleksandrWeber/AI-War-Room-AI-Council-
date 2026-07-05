import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const serializabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SerializabilityRolloutCheckStatus = z.infer<
  typeof serializabilityRolloutCheckStatusSchema
>

export const serializabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: serializabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SerializabilityRolloutCheck = z.infer<typeof serializabilityRolloutCheckSchema>

export const serializabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SerializabilityRolloutStatus = z.infer<typeof serializabilityRolloutStatusSchema>

export const serializabilityCapabilitiesResponseSchema = z.object({
  supportsSerializabilityRollout: z.literal(true),
  supportsSerializabilityAdminTools: z.literal(true),
  supportsProviderCredentialSerializabilitySignals: z.literal(true),
  supportsModelRegistrySerializabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SerializabilityCapabilitiesResponse = z.infer<
  typeof serializabilityCapabilitiesResponseSchema
>

export const serializabilityRolloutResponseSchema = z.object({
  status: serializabilityRolloutStatusSchema,
  checks: z.array(serializabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SerializabilityRolloutResponse = z.infer<
  typeof serializabilityRolloutResponseSchema
>

export function getSerializabilityRolloutGuidance() {
  return 'Production serializability rollout validates provider credential serializability, model registry serializability signals, billing webhook coverage, and serialization readiness before production serializability tooling.'
}
