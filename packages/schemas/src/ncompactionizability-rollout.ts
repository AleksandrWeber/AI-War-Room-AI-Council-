import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ncompactionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NcompactionizabilityRolloutCheckStatus = z.infer<
  typeof ncompactionizabilityRolloutCheckStatusSchema
>

export const ncompactionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ncompactionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NcompactionizabilityRolloutCheck = z.infer<typeof ncompactionizabilityRolloutCheckSchema>

export const ncompactionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NcompactionizabilityRolloutStatus = z.infer<typeof ncompactionizabilityRolloutStatusSchema>

export const ncompactionizabilityCapabilitiesResponseSchema = z.object({
  supportsNcompactionizabilityRollout: z.literal(true),
  supportsNcompactionizabilityAdminTools: z.literal(true),
  supportsMeterUsageNcompactionizabilitySignals: z.literal(true),
  supportsUsageEventNcompactionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NcompactionizabilityCapabilitiesResponse = z.infer<
  typeof ncompactionizabilityCapabilitiesResponseSchema
>

export const ncompactionizabilityRolloutResponseSchema = z.object({
  status: ncompactionizabilityRolloutStatusSchema,
  checks: z.array(ncompactionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NcompactionizabilityRolloutResponse = z.infer<
  typeof ncompactionizabilityRolloutResponseSchema
>

export function getNcompactionizabilityRolloutGuidance() {
  return 'Production ncompactionizability rollout validates meter usage ncompactionizability, usage event ncompactionizability signals, workspace limit coverage, and ncompactionization readiness before production ncompactionizability tooling.'
}
