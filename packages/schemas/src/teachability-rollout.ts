import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const teachabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TeachabilityRolloutCheckStatus = z.infer<
  typeof teachabilityRolloutCheckStatusSchema
>

export const teachabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: teachabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TeachabilityRolloutCheck = z.infer<typeof teachabilityRolloutCheckSchema>

export const teachabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TeachabilityRolloutStatus = z.infer<typeof teachabilityRolloutStatusSchema>

export const teachabilityCapabilitiesResponseSchema = z.object({
  supportsTeachabilityRollout: z.literal(true),
  supportsTeachabilityAdminTools: z.literal(true),
  supportsWorkflowTeachabilitySignals: z.literal(true),
  supportsAgentOutputTeachabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TeachabilityCapabilitiesResponse = z.infer<
  typeof teachabilityCapabilitiesResponseSchema
>

export const teachabilityRolloutResponseSchema = z.object({
  status: teachabilityRolloutStatusSchema,
  checks: z.array(teachabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TeachabilityRolloutResponse = z.infer<
  typeof teachabilityRolloutResponseSchema
>

export function getTeachabilityRolloutGuidance() {
  return 'Production teachability rollout validates workflow teachability, agent output teachability signals, membership coverage, and teaching readiness before production teachability tooling.'
}
