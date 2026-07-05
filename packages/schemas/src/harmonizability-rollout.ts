import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const harmonizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HarmonizabilityRolloutCheckStatus = z.infer<
  typeof harmonizabilityRolloutCheckStatusSchema
>

export const harmonizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: harmonizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HarmonizabilityRolloutCheck = z.infer<typeof harmonizabilityRolloutCheckSchema>

export const harmonizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HarmonizabilityRolloutStatus = z.infer<typeof harmonizabilityRolloutStatusSchema>

export const harmonizabilityCapabilitiesResponseSchema = z.object({
  supportsHarmonizabilityRollout: z.literal(true),
  supportsHarmonizabilityAdminTools: z.literal(true),
  supportsMeterUsageHarmonizabilitySignals: z.literal(true),
  supportsUsageEventHarmonizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HarmonizabilityCapabilitiesResponse = z.infer<
  typeof harmonizabilityCapabilitiesResponseSchema
>

export const harmonizabilityRolloutResponseSchema = z.object({
  status: harmonizabilityRolloutStatusSchema,
  checks: z.array(harmonizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HarmonizabilityRolloutResponse = z.infer<
  typeof harmonizabilityRolloutResponseSchema
>

export function getHarmonizabilityRolloutGuidance() {
  return 'Production harmonizability rollout validates meter usage harmonizability, usage event harmonizability signals, workspace limit coverage, and harmonization readiness before production harmonizability tooling.'
}
