import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const memorizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MemorizabilityRolloutCheckStatus = z.infer<
  typeof memorizabilityRolloutCheckStatusSchema
>

export const memorizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: memorizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MemorizabilityRolloutCheck = z.infer<typeof memorizabilityRolloutCheckSchema>

export const memorizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MemorizabilityRolloutStatus = z.infer<typeof memorizabilityRolloutStatusSchema>

export const memorizabilityCapabilitiesResponseSchema = z.object({
  supportsMemorizabilityRollout: z.literal(true),
  supportsMemorizabilityAdminTools: z.literal(true),
  supportsShieldScanMemorizabilitySignals: z.literal(true),
  supportsProviderCredentialMemorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MemorizabilityCapabilitiesResponse = z.infer<
  typeof memorizabilityCapabilitiesResponseSchema
>

export const memorizabilityRolloutResponseSchema = z.object({
  status: memorizabilityRolloutStatusSchema,
  checks: z.array(memorizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MemorizabilityRolloutResponse = z.infer<
  typeof memorizabilityRolloutResponseSchema
>

export function getMemorizabilityRolloutGuidance() {
  return 'Production memorizability rollout validates shield scan memorizability, provider credential memorizability signals, billing webhook coverage, and memorization readiness before production memorizability tooling.'
}
