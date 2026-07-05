import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const distributizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DistributizabilityRolloutCheckStatus = z.infer<
  typeof distributizabilityRolloutCheckStatusSchema
>

export const distributizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: distributizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DistributizabilityRolloutCheck = z.infer<typeof distributizabilityRolloutCheckSchema>

export const distributizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DistributizabilityRolloutStatus = z.infer<typeof distributizabilityRolloutStatusSchema>

export const distributizabilityCapabilitiesResponseSchema = z.object({
  supportsDistributizabilityRollout: z.literal(true),
  supportsDistributizabilityAdminTools: z.literal(true),
  supportsMeterUsageDistributizabilitySignals: z.literal(true),
  supportsUsageEventDistributizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DistributizabilityCapabilitiesResponse = z.infer<
  typeof distributizabilityCapabilitiesResponseSchema
>

export const distributizabilityRolloutResponseSchema = z.object({
  status: distributizabilityRolloutStatusSchema,
  checks: z.array(distributizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DistributizabilityRolloutResponse = z.infer<
  typeof distributizabilityRolloutResponseSchema
>

export function getDistributizabilityRolloutGuidance() {
  return 'Production distributizability rollout validates meter usage distributizability, usage event distributizability signals, workspace limit coverage, and distributization readiness before production distributizability tooling.'
}
