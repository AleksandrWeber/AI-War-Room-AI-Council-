import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const noticeabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NoticeabilityRolloutCheckStatus = z.infer<
  typeof noticeabilityRolloutCheckStatusSchema
>

export const noticeabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: noticeabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NoticeabilityRolloutCheck = z.infer<typeof noticeabilityRolloutCheckSchema>

export const noticeabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NoticeabilityRolloutStatus = z.infer<typeof noticeabilityRolloutStatusSchema>

export const noticeabilityCapabilitiesResponseSchema = z.object({
  supportsNoticeabilityRollout: z.literal(true),
  supportsNoticeabilityAdminTools: z.literal(true),
  supportsBillingNotificationNoticeabilitySignals: z.literal(true),
  supportsBillingWebhookNoticeabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NoticeabilityCapabilitiesResponse = z.infer<
  typeof noticeabilityCapabilitiesResponseSchema
>

export const noticeabilityRolloutResponseSchema = z.object({
  status: noticeabilityRolloutStatusSchema,
  checks: z.array(noticeabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NoticeabilityRolloutResponse = z.infer<
  typeof noticeabilityRolloutResponseSchema
>

export function getNoticeabilityRolloutGuidance() {
  return 'Production noticeability rollout validates billing notification noticeability, billing webhook noticeability signals, usage event coverage, and notice readiness before production noticeability tooling.'
}
