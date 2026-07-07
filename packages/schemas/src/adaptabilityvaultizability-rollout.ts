import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const adaptabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AdaptabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof adaptabilityvaultizabilityRolloutCheckStatusSchema
>

export const adaptabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: adaptabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AdaptabilityvaultizabilityRolloutCheck = z.infer<typeof adaptabilityvaultizabilityRolloutCheckSchema>

export const adaptabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AdaptabilityvaultizabilityRolloutStatus = z.infer<typeof adaptabilityvaultizabilityRolloutStatusSchema>

export const adaptabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAdaptabilityvaultizabilityRollout: z.literal(true),
  supportsAdaptabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipAdaptabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventAdaptabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AdaptabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof adaptabilityvaultizabilityCapabilitiesResponseSchema
>

export const adaptabilityvaultizabilityRolloutResponseSchema = z.object({
  status: adaptabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(adaptabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AdaptabilityvaultizabilityRolloutResponse = z.infer<
  typeof adaptabilityvaultizabilityRolloutResponseSchema
>

export function getAdaptabilityvaultizabilityRolloutGuidance() {
  return 'Production adaptabilityvaultizability rollout validates membership adaptabilityvaultizability, usage event adaptabilityvaultizability signals, billing notification coverage, and healingization readiness before production adaptabilityvaultizability tooling.'
}
