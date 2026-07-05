import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const oversightRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OversightRolloutCheckStatus = z.infer<
  typeof oversightRolloutCheckStatusSchema
>

export const oversightRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: oversightRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OversightRolloutCheck = z.infer<typeof oversightRolloutCheckSchema>

export const oversightRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OversightRolloutStatus = z.infer<
  typeof oversightRolloutStatusSchema
>

export const oversightCapabilitiesResponseSchema = z.object({
  supportsOversightRollout: z.literal(true),
  supportsOversightAdminTools: z.literal(true),
  supportsBillingOversightSignals: z.literal(true),
  supportsUsageOversightSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OversightCapabilitiesResponse = z.infer<
  typeof oversightCapabilitiesResponseSchema
>

export const oversightRolloutResponseSchema = z.object({
  status: oversightRolloutStatusSchema,
  checks: z.array(oversightRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OversightRolloutResponse = z.infer<
  typeof oversightRolloutResponseSchema
>

export function getOversightRolloutGuidance() {
  return 'Production oversight rollout validates billing oversight, usage oversight signals, invoice coverage, and control readiness before production oversight tooling.'
}
