import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const idempotencyRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IdempotencyRolloutCheckStatus = z.infer<
  typeof idempotencyRolloutCheckStatusSchema
>

export const idempotencyRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: idempotencyRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IdempotencyRolloutCheck = z.infer<typeof idempotencyRolloutCheckSchema>

export const idempotencyRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IdempotencyRolloutStatus = z.infer<typeof idempotencyRolloutStatusSchema>

export const idempotencyCapabilitiesResponseSchema = z.object({
  supportsIdempotencyRollout: z.literal(true),
  supportsIdempotencyAdminTools: z.literal(true),
  supportsRedisReservations: z.literal(true),
  defaultReservationTtlSeconds: z.number().int().positive(),
  guidance: nonEmptyStringSchema,
})
export type IdempotencyCapabilitiesResponse = z.infer<
  typeof idempotencyCapabilitiesResponseSchema
>

export const idempotencyRolloutResponseSchema = z.object({
  status: idempotencyRolloutStatusSchema,
  checks: z.array(idempotencyRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IdempotencyRolloutResponse = z.infer<
  typeof idempotencyRolloutResponseSchema
>

export function getIdempotencyRolloutGuidance() {
  return 'Idempotency rollout validates Redis reservations, persisted idempotency keys, and duplicate request protection before production rollout.'
}
