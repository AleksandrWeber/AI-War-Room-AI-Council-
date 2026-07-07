import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const schedulabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SchedulabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof schedulabilityvaultizabilityRolloutCheckStatusSchema
>

export const schedulabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: schedulabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SchedulabilityvaultizabilityRolloutCheck = z.infer<typeof schedulabilityvaultizabilityRolloutCheckSchema>

export const schedulabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SchedulabilityvaultizabilityRolloutStatus = z.infer<typeof schedulabilityvaultizabilityRolloutStatusSchema>

export const schedulabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsSchedulabilityvaultizabilityRollout: z.literal(true),
  supportsSchedulabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipSchedulabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventSchedulabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SchedulabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof schedulabilityvaultizabilityCapabilitiesResponseSchema
>

export const schedulabilityvaultizabilityRolloutResponseSchema = z.object({
  status: schedulabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(schedulabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SchedulabilityvaultizabilityRolloutResponse = z.infer<
  typeof schedulabilityvaultizabilityRolloutResponseSchema
>

export function getSchedulabilityvaultizabilityRolloutGuidance() {
  return 'Production schedulabilityvaultizability rollout validates membership schedulabilityvaultizability, usage event schedulabilityvaultizability signals, billing notification coverage, and healingization readiness before production schedulabilityvaultizability tooling.'
}
