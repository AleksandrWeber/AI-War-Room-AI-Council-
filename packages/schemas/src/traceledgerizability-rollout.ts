import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const traceledgerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TraceledgerizabilityRolloutCheckStatus = z.infer<
  typeof traceledgerizabilityRolloutCheckStatusSchema
>

export const traceledgerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: traceledgerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TraceledgerizabilityRolloutCheck = z.infer<typeof traceledgerizabilityRolloutCheckSchema>

export const traceledgerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TraceledgerizabilityRolloutStatus = z.infer<typeof traceledgerizabilityRolloutStatusSchema>

export const traceledgerizabilityCapabilitiesResponseSchema = z.object({
  supportsTraceledgerizabilityRollout: z.literal(true),
  supportsTraceledgerizabilityAdminTools: z.literal(true),
  supportsMembershipTraceledgerizabilitySignals: z.literal(true),
  supportsUsageEventTraceledgerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TraceledgerizabilityCapabilitiesResponse = z.infer<
  typeof traceledgerizabilityCapabilitiesResponseSchema
>

export const traceledgerizabilityRolloutResponseSchema = z.object({
  status: traceledgerizabilityRolloutStatusSchema,
  checks: z.array(traceledgerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TraceledgerizabilityRolloutResponse = z.infer<
  typeof traceledgerizabilityRolloutResponseSchema
>

export function getTraceledgerizabilityRolloutGuidance() {
  return 'Production traceledgerizability rollout validates membership traceledgerizability, usage event traceledgerizability signals, billing notification coverage, and healingization readiness before production traceledgerizability tooling.'
}
