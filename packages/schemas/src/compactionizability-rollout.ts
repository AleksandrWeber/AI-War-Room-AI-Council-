import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compactionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompactionizabilityRolloutCheckStatus = z.infer<
  typeof compactionizabilityRolloutCheckStatusSchema
>

export const compactionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compactionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompactionizabilityRolloutCheck = z.infer<typeof compactionizabilityRolloutCheckSchema>

export const compactionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompactionizabilityRolloutStatus = z.infer<typeof compactionizabilityRolloutStatusSchema>

export const compactionizabilityCapabilitiesResponseSchema = z.object({
  supportsCompactionizabilityRollout: z.literal(true),
  supportsCompactionizabilityAdminTools: z.literal(true),
  supportsBillingWebhookCompactionizabilitySignals: z.literal(true),
  supportsBillingRecordCompactionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompactionizabilityCapabilitiesResponse = z.infer<
  typeof compactionizabilityCapabilitiesResponseSchema
>

export const compactionizabilityRolloutResponseSchema = z.object({
  status: compactionizabilityRolloutStatusSchema,
  checks: z.array(compactionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompactionizabilityRolloutResponse = z.infer<
  typeof compactionizabilityRolloutResponseSchema
>

export function getCompactionizabilityRolloutGuidance() {
  return 'Production compactionizability rollout validates billing webhook compactionizability, billing record compactionizability signals, usage event coverage, and interpolation readiness before production compactionizability tooling.'
}
