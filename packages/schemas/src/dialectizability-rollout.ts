import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dialectizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DialectizabilityRolloutCheckStatus = z.infer<
  typeof dialectizabilityRolloutCheckStatusSchema
>

export const dialectizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dialectizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DialectizabilityRolloutCheck = z.infer<typeof dialectizabilityRolloutCheckSchema>

export const dialectizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DialectizabilityRolloutStatus = z.infer<typeof dialectizabilityRolloutStatusSchema>

export const dialectizabilityCapabilitiesResponseSchema = z.object({
  supportsDialectizabilityRollout: z.literal(true),
  supportsDialectizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyDialectizabilitySignals: z.literal(true),
  supportsUsageEventDialectizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DialectizabilityCapabilitiesResponse = z.infer<
  typeof dialectizabilityCapabilitiesResponseSchema
>

export const dialectizabilityRolloutResponseSchema = z.object({
  status: dialectizabilityRolloutStatusSchema,
  checks: z.array(dialectizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DialectizabilityRolloutResponse = z.infer<
  typeof dialectizabilityRolloutResponseSchema
>

export function getDialectizabilityRolloutGuidance() {
  return 'Production dialectizability rollout validates idempotency key dialectizability, usage event dialectizability signals, billing webhook coverage, and dialectization readiness before production dialectizability tooling.'
}
