import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const presentabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PresentabilityRolloutCheckStatus = z.infer<
  typeof presentabilityRolloutCheckStatusSchema
>

export const presentabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: presentabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PresentabilityRolloutCheck = z.infer<typeof presentabilityRolloutCheckSchema>

export const presentabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PresentabilityRolloutStatus = z.infer<typeof presentabilityRolloutStatusSchema>

export const presentabilityCapabilitiesResponseSchema = z.object({
  supportsPresentabilityRollout: z.literal(true),
  supportsPresentabilityAdminTools: z.literal(true),
  supportsUsageEventPresentabilitySignals: z.literal(true),
  supportsMeterUsagePresentabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PresentabilityCapabilitiesResponse = z.infer<
  typeof presentabilityCapabilitiesResponseSchema
>

export const presentabilityRolloutResponseSchema = z.object({
  status: presentabilityRolloutStatusSchema,
  checks: z.array(presentabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PresentabilityRolloutResponse = z.infer<
  typeof presentabilityRolloutResponseSchema
>

export function getPresentabilityRolloutGuidance() {
  return 'Production presentability rollout validates usage event presentability, meter usage presentability signals, workspace limit coverage, and presentation readiness before production presentability tooling.'
}
