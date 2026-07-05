import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const connotabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConnotabilityRolloutCheckStatus = z.infer<
  typeof connotabilityRolloutCheckStatusSchema
>

export const connotabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: connotabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConnotabilityRolloutCheck = z.infer<typeof connotabilityRolloutCheckSchema>

export const connotabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConnotabilityRolloutStatus = z.infer<typeof connotabilityRolloutStatusSchema>

export const connotabilityCapabilitiesResponseSchema = z.object({
  supportsConnotabilityRollout: z.literal(true),
  supportsConnotabilityAdminTools: z.literal(true),
  supportsMeterUsageConnotabilitySignals: z.literal(true),
  supportsUsageEventConnotabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConnotabilityCapabilitiesResponse = z.infer<
  typeof connotabilityCapabilitiesResponseSchema
>

export const connotabilityRolloutResponseSchema = z.object({
  status: connotabilityRolloutStatusSchema,
  checks: z.array(connotabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConnotabilityRolloutResponse = z.infer<
  typeof connotabilityRolloutResponseSchema
>

export function getConnotabilityRolloutGuidance() {
  return 'Production connotability rollout validates meter usage connotability, usage event connotability signals, workspace limit coverage, and connotation readiness before production connotability tooling.'
}
