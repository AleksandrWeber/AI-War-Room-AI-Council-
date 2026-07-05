import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const benchmarkizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BenchmarkizabilityRolloutCheckStatus = z.infer<
  typeof benchmarkizabilityRolloutCheckStatusSchema
>

export const benchmarkizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: benchmarkizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BenchmarkizabilityRolloutCheck = z.infer<typeof benchmarkizabilityRolloutCheckSchema>

export const benchmarkizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BenchmarkizabilityRolloutStatus = z.infer<typeof benchmarkizabilityRolloutStatusSchema>

export const benchmarkizabilityCapabilitiesResponseSchema = z.object({
  supportsBenchmarkizabilityRollout: z.literal(true),
  supportsBenchmarkizabilityAdminTools: z.literal(true),
  supportsMembershipBenchmarkizabilitySignals: z.literal(true),
  supportsUsageEventBenchmarkizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BenchmarkizabilityCapabilitiesResponse = z.infer<
  typeof benchmarkizabilityCapabilitiesResponseSchema
>

export const benchmarkizabilityRolloutResponseSchema = z.object({
  status: benchmarkizabilityRolloutStatusSchema,
  checks: z.array(benchmarkizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BenchmarkizabilityRolloutResponse = z.infer<
  typeof benchmarkizabilityRolloutResponseSchema
>

export function getBenchmarkizabilityRolloutGuidance() {
  return 'Production benchmarkizability rollout validates membership benchmarkizability, usage event benchmarkizability signals, billing notification coverage, and benchmarkization readiness before production benchmarkizability tooling.'
}
