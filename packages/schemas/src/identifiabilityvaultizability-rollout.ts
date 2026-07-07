import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const identifiabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IdentifiabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof identifiabilityvaultizabilityRolloutCheckStatusSchema
>

export const identifiabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: identifiabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IdentifiabilityvaultizabilityRolloutCheck = z.infer<typeof identifiabilityvaultizabilityRolloutCheckSchema>

export const identifiabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IdentifiabilityvaultizabilityRolloutStatus = z.infer<typeof identifiabilityvaultizabilityRolloutStatusSchema>

export const identifiabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsIdentifiabilityvaultizabilityRollout: z.literal(true),
  supportsIdentifiabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipIdentifiabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventIdentifiabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IdentifiabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof identifiabilityvaultizabilityCapabilitiesResponseSchema
>

export const identifiabilityvaultizabilityRolloutResponseSchema = z.object({
  status: identifiabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(identifiabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IdentifiabilityvaultizabilityRolloutResponse = z.infer<
  typeof identifiabilityvaultizabilityRolloutResponseSchema
>

export function getIdentifiabilityvaultizabilityRolloutGuidance() {
  return 'Production identifiabilityvaultizability rollout validates membership identifiabilityvaultizability, usage event identifiabilityvaultizability signals, billing notification coverage, and healingization readiness before production identifiabilityvaultizability tooling.'
}
