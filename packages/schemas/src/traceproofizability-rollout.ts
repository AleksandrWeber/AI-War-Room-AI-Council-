import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const traceproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TraceproofizabilityRolloutCheckStatus = z.infer<
  typeof traceproofizabilityRolloutCheckStatusSchema
>

export const traceproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: traceproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TraceproofizabilityRolloutCheck = z.infer<typeof traceproofizabilityRolloutCheckSchema>

export const traceproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TraceproofizabilityRolloutStatus = z.infer<typeof traceproofizabilityRolloutStatusSchema>

export const traceproofizabilityCapabilitiesResponseSchema = z.object({
  supportsTraceproofizabilityRollout: z.literal(true),
  supportsTraceproofizabilityAdminTools: z.literal(true),
  supportsMembershipTraceproofizabilitySignals: z.literal(true),
  supportsUsageEventTraceproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TraceproofizabilityCapabilitiesResponse = z.infer<
  typeof traceproofizabilityCapabilitiesResponseSchema
>

export const traceproofizabilityRolloutResponseSchema = z.object({
  status: traceproofizabilityRolloutStatusSchema,
  checks: z.array(traceproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TraceproofizabilityRolloutResponse = z.infer<
  typeof traceproofizabilityRolloutResponseSchema
>

export function getTraceproofizabilityRolloutGuidance() {
  return 'Production traceproofizability rollout validates membership traceproofizability, usage event traceproofizability signals, billing notification coverage, and healingization readiness before production traceproofizability tooling.'
}
