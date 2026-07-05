import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const modularizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ModularizabilityRolloutCheckStatus = z.infer<
  typeof modularizabilityRolloutCheckStatusSchema
>

export const modularizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: modularizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ModularizabilityRolloutCheck = z.infer<typeof modularizabilityRolloutCheckSchema>

export const modularizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ModularizabilityRolloutStatus = z.infer<typeof modularizabilityRolloutStatusSchema>

export const modularizabilityCapabilitiesResponseSchema = z.object({
  supportsModularizabilityRollout: z.literal(true),
  supportsModularizabilityAdminTools: z.literal(true),
  supportsMembershipModularizabilitySignals: z.literal(true),
  supportsUsageEventModularizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ModularizabilityCapabilitiesResponse = z.infer<
  typeof modularizabilityCapabilitiesResponseSchema
>

export const modularizabilityRolloutResponseSchema = z.object({
  status: modularizabilityRolloutStatusSchema,
  checks: z.array(modularizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ModularizabilityRolloutResponse = z.infer<
  typeof modularizabilityRolloutResponseSchema
>

export function getModularizabilityRolloutGuidance() {
  return 'Production modularizability rollout validates membership modularizability, usage event modularizability signals, billing notification coverage, and modularization readiness before production modularizability tooling.'
}
