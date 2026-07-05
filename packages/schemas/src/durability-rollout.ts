import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const durabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DurabilityRolloutCheckStatus = z.infer<
  typeof durabilityRolloutCheckStatusSchema
>

export const durabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: durabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DurabilityRolloutCheck = z.infer<
  typeof durabilityRolloutCheckSchema
>

export const durabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DurabilityRolloutStatus = z.infer<
  typeof durabilityRolloutStatusSchema
>

export const durabilityCapabilitiesResponseSchema = z.object({
  supportsDurabilityRollout: z.literal(true),
  supportsDurabilityAdminTools: z.literal(true),
  supportsArtifactPersistenceSignals: z.literal(true),
  supportsRedisPersistenceSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DurabilityCapabilitiesResponse = z.infer<
  typeof durabilityCapabilitiesResponseSchema
>

export const durabilityRolloutResponseSchema = z.object({
  status: durabilityRolloutStatusSchema,
  checks: z.array(durabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DurabilityRolloutResponse = z.infer<
  typeof durabilityRolloutResponseSchema
>

export function getDurabilityRolloutGuidance() {
  return 'Production durability rollout validates artifact persistence, usage event durability, Redis persistence signals, and persistence readiness before production durability tooling.'
}
