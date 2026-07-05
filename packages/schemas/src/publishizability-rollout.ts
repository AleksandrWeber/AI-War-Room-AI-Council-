import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const publishizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PublishizabilityRolloutCheckStatus = z.infer<
  typeof publishizabilityRolloutCheckStatusSchema
>

export const publishizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: publishizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PublishizabilityRolloutCheck = z.infer<typeof publishizabilityRolloutCheckSchema>

export const publishizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PublishizabilityRolloutStatus = z.infer<typeof publishizabilityRolloutStatusSchema>

export const publishizabilityCapabilitiesResponseSchema = z.object({
  supportsPublishizabilityRollout: z.literal(true),
  supportsPublishizabilityAdminTools: z.literal(true),
  supportsMeterUsagePublishizabilitySignals: z.literal(true),
  supportsUsageEventPublishizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PublishizabilityCapabilitiesResponse = z.infer<
  typeof publishizabilityCapabilitiesResponseSchema
>

export const publishizabilityRolloutResponseSchema = z.object({
  status: publishizabilityRolloutStatusSchema,
  checks: z.array(publishizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PublishizabilityRolloutResponse = z.infer<
  typeof publishizabilityRolloutResponseSchema
>

export function getPublishizabilityRolloutGuidance() {
  return 'Production publishizability rollout validates meter usage publishizability, usage event publishizability signals, workspace limit coverage, and publishization readiness before production publishizability tooling.'
}
