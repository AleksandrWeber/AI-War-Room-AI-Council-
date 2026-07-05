import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const interoperabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InteroperabilizabilityRolloutCheckStatus = z.infer<
  typeof interoperabilizabilityRolloutCheckStatusSchema
>

export const interoperabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: interoperabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InteroperabilizabilityRolloutCheck = z.infer<typeof interoperabilizabilityRolloutCheckSchema>

export const interoperabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InteroperabilizabilityRolloutStatus = z.infer<typeof interoperabilizabilityRolloutStatusSchema>

export const interoperabilizabilityCapabilitiesResponseSchema = z.object({
  supportsInteroperabilizabilityRollout: z.literal(true),
  supportsInteroperabilizabilityAdminTools: z.literal(true),
  supportsMeterUsageInteroperabilizabilitySignals: z.literal(true),
  supportsUsageEventInteroperabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InteroperabilizabilityCapabilitiesResponse = z.infer<
  typeof interoperabilizabilityCapabilitiesResponseSchema
>

export const interoperabilizabilityRolloutResponseSchema = z.object({
  status: interoperabilizabilityRolloutStatusSchema,
  checks: z.array(interoperabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InteroperabilizabilityRolloutResponse = z.infer<
  typeof interoperabilizabilityRolloutResponseSchema
>

export function getInteroperabilizabilityRolloutGuidance() {
  return 'Production interoperabilizability rollout validates meter usage interoperabilizability, usage event interoperabilizability signals, workspace limit coverage, and interoperabilization readiness before production interoperabilizability tooling.'
}
