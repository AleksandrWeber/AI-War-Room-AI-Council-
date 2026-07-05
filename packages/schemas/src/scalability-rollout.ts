import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const scalabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ScalabilityRolloutCheckStatus = z.infer<
  typeof scalabilityRolloutCheckStatusSchema
>

export const scalabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: scalabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ScalabilityRolloutCheck = z.infer<
  typeof scalabilityRolloutCheckSchema
>

export const scalabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ScalabilityRolloutStatus = z.infer<
  typeof scalabilityRolloutStatusSchema
>

export const scalabilityCapabilitiesResponseSchema = z.object({
  supportsScalabilityRollout: z.literal(true),
  supportsScalabilityAdminTools: z.literal(true),
  supportsWorkspaceGrowthSignals: z.literal(true),
  supportsUsageLimitScalabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ScalabilityCapabilitiesResponse = z.infer<
  typeof scalabilityCapabilitiesResponseSchema
>

export const scalabilityRolloutResponseSchema = z.object({
  status: scalabilityRolloutStatusSchema,
  checks: z.array(scalabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ScalabilityRolloutResponse = z.infer<
  typeof scalabilityRolloutResponseSchema
>

export function getScalabilityRolloutGuidance() {
  return 'Production scalability rollout validates workspace growth signals, usage limit scalability, membership coverage, and growth readiness before production scalability tooling.'
}
