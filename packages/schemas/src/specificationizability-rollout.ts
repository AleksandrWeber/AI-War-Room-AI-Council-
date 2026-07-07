import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const specificationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SpecificationizabilityRolloutCheckStatus = z.infer<
  typeof specificationizabilityRolloutCheckStatusSchema
>

export const specificationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: specificationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SpecificationizabilityRolloutCheck = z.infer<typeof specificationizabilityRolloutCheckSchema>

export const specificationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SpecificationizabilityRolloutStatus = z.infer<typeof specificationizabilityRolloutStatusSchema>

export const specificationizabilityCapabilitiesResponseSchema = z.object({
  supportsSpecificationizabilityRollout: z.literal(true),
  supportsSpecificationizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeySpecificationizabilitySignals: z.literal(true),
  supportsUsageEventSpecificationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SpecificationizabilityCapabilitiesResponse = z.infer<
  typeof specificationizabilityCapabilitiesResponseSchema
>

export const specificationizabilityRolloutResponseSchema = z.object({
  status: specificationizabilityRolloutStatusSchema,
  checks: z.array(specificationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SpecificationizabilityRolloutResponse = z.infer<
  typeof specificationizabilityRolloutResponseSchema
>

export function getSpecificationizabilityRolloutGuidance() {
  return 'Production specificationizability rollout validates idempotency key specificationizability, usage event specificationizability signals, billing webhook coverage, and remediationization readiness before production specificationizability tooling.'
}
