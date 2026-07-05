import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const recoverabilityRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type RecoverabilityRolloutCheckStatus = z.infer<
  typeof recoverabilityRolloutCheckStatusSchema
>

export const recoverabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: recoverabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RecoverabilityRolloutCheck = z.infer<
  typeof recoverabilityRolloutCheckSchema
>

export const recoverabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RecoverabilityRolloutStatus = z.infer<
  typeof recoverabilityRolloutStatusSchema
>

export const recoverabilityCapabilitiesResponseSchema = z.object({
  supportsRecoverabilityRollout: z.literal(true),
  supportsRecoverabilityAdminTools: z.literal(true),
  supportsRunWorkflowRecoverySignals: z.literal(true),
  supportsStreamRecoverySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RecoverabilityCapabilitiesResponse = z.infer<
  typeof recoverabilityCapabilitiesResponseSchema
>

export const recoverabilityRolloutResponseSchema = z.object({
  status: recoverabilityRolloutStatusSchema,
  checks: z.array(recoverabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RecoverabilityRolloutResponse = z.infer<
  typeof recoverabilityRolloutResponseSchema
>

export function getRecoverabilityRolloutGuidance() {
  return 'Production recoverability rollout validates run workflow recovery, stream buffer recovery, idempotency recovery signals, and recovery readiness before production recoverability tooling.'
}
