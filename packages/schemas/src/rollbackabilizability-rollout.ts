import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const rollbackabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RollbackabilizabilityRolloutCheckStatus = z.infer<
  typeof rollbackabilizabilityRolloutCheckStatusSchema
>

export const rollbackabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: rollbackabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RollbackabilizabilityRolloutCheck = z.infer<typeof rollbackabilizabilityRolloutCheckSchema>

export const rollbackabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RollbackabilizabilityRolloutStatus = z.infer<typeof rollbackabilizabilityRolloutStatusSchema>

export const rollbackabilizabilityCapabilitiesResponseSchema = z.object({
  supportsRollbackabilizabilityRollout: z.literal(true),
  supportsRollbackabilizabilityAdminTools: z.literal(true),
  supportsBillingWebhookRollbackabilizabilitySignals: z.literal(true),
  supportsBillingRecordRollbackabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RollbackabilizabilityCapabilitiesResponse = z.infer<
  typeof rollbackabilizabilityCapabilitiesResponseSchema
>

export const rollbackabilizabilityRolloutResponseSchema = z.object({
  status: rollbackabilizabilityRolloutStatusSchema,
  checks: z.array(rollbackabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RollbackabilizabilityRolloutResponse = z.infer<
  typeof rollbackabilizabilityRolloutResponseSchema
>

export function getRollbackabilizabilityRolloutGuidance() {
  return 'Production rollbackabilizability rollout validates billing webhook rollbackabilizability, billing record rollbackabilizability signals, usage event coverage, and interpolation readiness before production rollbackabilizability tooling.'
}
