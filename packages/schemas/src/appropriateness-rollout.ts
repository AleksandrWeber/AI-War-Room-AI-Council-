import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const appropriatenessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AppropriatenessRolloutCheckStatus = z.infer<
  typeof appropriatenessRolloutCheckStatusSchema
>

export const appropriatenessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: appropriatenessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AppropriatenessRolloutCheck = z.infer<typeof appropriatenessRolloutCheckSchema>

export const appropriatenessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AppropriatenessRolloutStatus = z.infer<typeof appropriatenessRolloutStatusSchema>

export const appropriatenessCapabilitiesResponseSchema = z.object({
  supportsAppropriatenessRollout: z.literal(true),
  supportsAppropriatenessAdminTools: z.literal(true),
  supportsBillingInvoiceAppropriatenessSignals: z.literal(true),
  supportsBillingRecordAppropriatenessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AppropriatenessCapabilitiesResponse = z.infer<
  typeof appropriatenessCapabilitiesResponseSchema
>

export const appropriatenessRolloutResponseSchema = z.object({
  status: appropriatenessRolloutStatusSchema,
  checks: z.array(appropriatenessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AppropriatenessRolloutResponse = z.infer<
  typeof appropriatenessRolloutResponseSchema
>

export function getAppropriatenessRolloutGuidance() {
  return 'Production appropriateness rollout validates billing invoice appropriateness, billing record appropriateness signals, billing notification coverage, and appropriateness readiness before production appropriateness tooling.'
}
