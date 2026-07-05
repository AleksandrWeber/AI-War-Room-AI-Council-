import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const coordinationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CoordinationizabilityRolloutCheckStatus = z.infer<
  typeof coordinationizabilityRolloutCheckStatusSchema
>

export const coordinationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: coordinationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CoordinationizabilityRolloutCheck = z.infer<typeof coordinationizabilityRolloutCheckSchema>

export const coordinationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CoordinationizabilityRolloutStatus = z.infer<typeof coordinationizabilityRolloutStatusSchema>

export const coordinationizabilityCapabilitiesResponseSchema = z.object({
  supportsCoordinationizabilityRollout: z.literal(true),
  supportsCoordinationizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyCoordinationizabilitySignals: z.literal(true),
  supportsUsageEventCoordinationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CoordinationizabilityCapabilitiesResponse = z.infer<
  typeof coordinationizabilityCapabilitiesResponseSchema
>

export const coordinationizabilityRolloutResponseSchema = z.object({
  status: coordinationizabilityRolloutStatusSchema,
  checks: z.array(coordinationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CoordinationizabilityRolloutResponse = z.infer<
  typeof coordinationizabilityRolloutResponseSchema
>

export function getCoordinationizabilityRolloutGuidance() {
  return 'Production coordinationizability rollout validates idempotency key coordinationizability, usage event coordinationizability signals, billing webhook coverage, and coordinationization readiness before production coordinationizability tooling.'
}
