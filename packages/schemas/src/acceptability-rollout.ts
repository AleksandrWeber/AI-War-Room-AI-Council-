import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const acceptabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AcceptabilityRolloutCheckStatus = z.infer<
  typeof acceptabilityRolloutCheckStatusSchema
>

export const acceptabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: acceptabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AcceptabilityRolloutCheck = z.infer<typeof acceptabilityRolloutCheckSchema>

export const acceptabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AcceptabilityRolloutStatus = z.infer<typeof acceptabilityRolloutStatusSchema>

export const acceptabilityCapabilitiesResponseSchema = z.object({
  supportsAcceptabilityRollout: z.literal(true),
  supportsAcceptabilityAdminTools: z.literal(true),
  supportsBillingRecordAcceptabilitySignals: z.literal(true),
  supportsBillingInvoiceAcceptabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AcceptabilityCapabilitiesResponse = z.infer<
  typeof acceptabilityCapabilitiesResponseSchema
>

export const acceptabilityRolloutResponseSchema = z.object({
  status: acceptabilityRolloutStatusSchema,
  checks: z.array(acceptabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AcceptabilityRolloutResponse = z.infer<
  typeof acceptabilityRolloutResponseSchema
>

export function getAcceptabilityRolloutGuidance() {
  return 'Production acceptability rollout validates billing record acceptability, billing invoice acceptability signals, workspace limit coverage, and acceptance readiness before production acceptability tooling.'
}
