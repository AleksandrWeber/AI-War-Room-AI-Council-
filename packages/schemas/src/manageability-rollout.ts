import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const manageabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ManageabilityRolloutCheckStatus = z.infer<
  typeof manageabilityRolloutCheckStatusSchema
>

export const manageabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: manageabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ManageabilityRolloutCheck = z.infer<typeof manageabilityRolloutCheckSchema>

export const manageabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ManageabilityRolloutStatus = z.infer<typeof manageabilityRolloutStatusSchema>

export const manageabilityCapabilitiesResponseSchema = z.object({
  supportsManageabilityRollout: z.literal(true),
  supportsManageabilityAdminTools: z.literal(true),
  supportsBillingNotificationManageabilitySignals: z.literal(true),
  supportsBillingRecordManageabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ManageabilityCapabilitiesResponse = z.infer<
  typeof manageabilityCapabilitiesResponseSchema
>

export const manageabilityRolloutResponseSchema = z.object({
  status: manageabilityRolloutStatusSchema,
  checks: z.array(manageabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ManageabilityRolloutResponse = z.infer<
  typeof manageabilityRolloutResponseSchema
>

export function getManageabilityRolloutGuidance() {
  return 'Production manageability rollout validates billing notification manageability, billing record manageability signals, idempotency coverage, and management readiness before production manageability tooling.'
}
