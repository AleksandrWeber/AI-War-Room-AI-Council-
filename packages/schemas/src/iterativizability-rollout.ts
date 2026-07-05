import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const iterativizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IterativizabilityRolloutCheckStatus = z.infer<
  typeof iterativizabilityRolloutCheckStatusSchema
>

export const iterativizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: iterativizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IterativizabilityRolloutCheck = z.infer<typeof iterativizabilityRolloutCheckSchema>

export const iterativizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IterativizabilityRolloutStatus = z.infer<typeof iterativizabilityRolloutStatusSchema>

export const iterativizabilityCapabilitiesResponseSchema = z.object({
  supportsIterativizabilityRollout: z.literal(true),
  supportsIterativizabilityAdminTools: z.literal(true),
  supportsMeterUsageIterativizabilitySignals: z.literal(true),
  supportsUsageEventIterativizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IterativizabilityCapabilitiesResponse = z.infer<
  typeof iterativizabilityCapabilitiesResponseSchema
>

export const iterativizabilityRolloutResponseSchema = z.object({
  status: iterativizabilityRolloutStatusSchema,
  checks: z.array(iterativizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IterativizabilityRolloutResponse = z.infer<
  typeof iterativizabilityRolloutResponseSchema
>

export function getIterativizabilityRolloutGuidance() {
  return 'Production iterativizability rollout validates meter usage iterativizability, usage event iterativizability signals, workspace limit coverage, and iterativization readiness before production iterativizability tooling.'
}
