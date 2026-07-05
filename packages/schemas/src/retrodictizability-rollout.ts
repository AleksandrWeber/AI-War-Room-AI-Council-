import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const retrodictizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RetrodictizabilityRolloutCheckStatus = z.infer<
  typeof retrodictizabilityRolloutCheckStatusSchema
>

export const retrodictizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: retrodictizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RetrodictizabilityRolloutCheck = z.infer<typeof retrodictizabilityRolloutCheckSchema>

export const retrodictizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RetrodictizabilityRolloutStatus = z.infer<typeof retrodictizabilityRolloutStatusSchema>

export const retrodictizabilityCapabilitiesResponseSchema = z.object({
  supportsRetrodictizabilityRollout: z.literal(true),
  supportsRetrodictizabilityAdminTools: z.literal(true),
  supportsMembershipRetrodictizabilitySignals: z.literal(true),
  supportsUsageEventRetrodictizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RetrodictizabilityCapabilitiesResponse = z.infer<
  typeof retrodictizabilityCapabilitiesResponseSchema
>

export const retrodictizabilityRolloutResponseSchema = z.object({
  status: retrodictizabilityRolloutStatusSchema,
  checks: z.array(retrodictizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RetrodictizabilityRolloutResponse = z.infer<
  typeof retrodictizabilityRolloutResponseSchema
>

export function getRetrodictizabilityRolloutGuidance() {
  return 'Production retrodictizability rollout validates membership retrodictizability, usage event retrodictizability signals, billing notification coverage, and retrodictization readiness before production retrodictizability tooling.'
}
