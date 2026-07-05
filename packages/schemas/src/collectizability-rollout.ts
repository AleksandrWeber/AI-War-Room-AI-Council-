import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const collectizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CollectizabilityRolloutCheckStatus = z.infer<
  typeof collectizabilityRolloutCheckStatusSchema
>

export const collectizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: collectizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CollectizabilityRolloutCheck = z.infer<typeof collectizabilityRolloutCheckSchema>

export const collectizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CollectizabilityRolloutStatus = z.infer<typeof collectizabilityRolloutStatusSchema>

export const collectizabilityCapabilitiesResponseSchema = z.object({
  supportsCollectizabilityRollout: z.literal(true),
  supportsCollectizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitCollectizabilitySignals: z.literal(true),
  supportsUsageEventCollectizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CollectizabilityCapabilitiesResponse = z.infer<
  typeof collectizabilityCapabilitiesResponseSchema
>

export const collectizabilityRolloutResponseSchema = z.object({
  status: collectizabilityRolloutStatusSchema,
  checks: z.array(collectizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CollectizabilityRolloutResponse = z.infer<
  typeof collectizabilityRolloutResponseSchema
>

export function getCollectizabilityRolloutGuidance() {
  return 'Production collectizability rollout validates workspace limit collectizability, usage event collectizability signals, billing record coverage, and collectization readiness before production collectizability tooling.'
}
