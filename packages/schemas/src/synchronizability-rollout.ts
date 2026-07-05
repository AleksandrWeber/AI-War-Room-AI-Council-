import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const synchronizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SynchronizabilityRolloutCheckStatus = z.infer<
  typeof synchronizabilityRolloutCheckStatusSchema
>

export const synchronizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: synchronizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SynchronizabilityRolloutCheck = z.infer<typeof synchronizabilityRolloutCheckSchema>

export const synchronizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SynchronizabilityRolloutStatus = z.infer<typeof synchronizabilityRolloutStatusSchema>

export const synchronizabilityCapabilitiesResponseSchema = z.object({
  supportsSynchronizabilityRollout: z.literal(true),
  supportsSynchronizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeySynchronizabilitySignals: z.literal(true),
  supportsUsageEventSynchronizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SynchronizabilityCapabilitiesResponse = z.infer<
  typeof synchronizabilityCapabilitiesResponseSchema
>

export const synchronizabilityRolloutResponseSchema = z.object({
  status: synchronizabilityRolloutStatusSchema,
  checks: z.array(synchronizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SynchronizabilityRolloutResponse = z.infer<
  typeof synchronizabilityRolloutResponseSchema
>

export function getSynchronizabilityRolloutGuidance() {
  return 'Production synchronizability rollout validates idempotency key synchronizability, usage event synchronizability signals, billing webhook coverage, and synchronization readiness before production synchronizability tooling.'
}
