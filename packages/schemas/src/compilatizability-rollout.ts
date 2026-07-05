import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compilatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompilatizabilityRolloutCheckStatus = z.infer<
  typeof compilatizabilityRolloutCheckStatusSchema
>

export const compilatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compilatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompilatizabilityRolloutCheck = z.infer<typeof compilatizabilityRolloutCheckSchema>

export const compilatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompilatizabilityRolloutStatus = z.infer<typeof compilatizabilityRolloutStatusSchema>

export const compilatizabilityCapabilitiesResponseSchema = z.object({
  supportsCompilatizabilityRollout: z.literal(true),
  supportsCompilatizabilityAdminTools: z.literal(true),
  supportsModelHealthCompilatizabilitySignals: z.literal(true),
  supportsModelRegistryCompilatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompilatizabilityCapabilitiesResponse = z.infer<
  typeof compilatizabilityCapabilitiesResponseSchema
>

export const compilatizabilityRolloutResponseSchema = z.object({
  status: compilatizabilityRolloutStatusSchema,
  checks: z.array(compilatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompilatizabilityRolloutResponse = z.infer<
  typeof compilatizabilityRolloutResponseSchema
>

export function getCompilatizabilityRolloutGuidance() {
  return 'Production compilatizability rollout validates model health compilatizability, model registry compilatizability signals, billing record coverage, and compilatization readiness before production compilatizability tooling.'
}
