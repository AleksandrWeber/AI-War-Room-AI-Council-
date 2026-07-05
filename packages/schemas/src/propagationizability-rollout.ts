import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const propagationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PropagationizabilityRolloutCheckStatus = z.infer<
  typeof propagationizabilityRolloutCheckStatusSchema
>

export const propagationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: propagationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PropagationizabilityRolloutCheck = z.infer<typeof propagationizabilityRolloutCheckSchema>

export const propagationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PropagationizabilityRolloutStatus = z.infer<typeof propagationizabilityRolloutStatusSchema>

export const propagationizabilityCapabilitiesResponseSchema = z.object({
  supportsPropagationizabilityRollout: z.literal(true),
  supportsPropagationizabilityAdminTools: z.literal(true),
  supportsProviderCredentialPropagationizabilitySignals: z.literal(true),
  supportsModelRegistryPropagationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PropagationizabilityCapabilitiesResponse = z.infer<
  typeof propagationizabilityCapabilitiesResponseSchema
>

export const propagationizabilityRolloutResponseSchema = z.object({
  status: propagationizabilityRolloutStatusSchema,
  checks: z.array(propagationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PropagationizabilityRolloutResponse = z.infer<
  typeof propagationizabilityRolloutResponseSchema
>

export function getPropagationizabilityRolloutGuidance() {
  return 'Production propagationizability rollout validates provider credential propagationizability, model registry propagationizability signals, billing webhook coverage, and propagationization readiness before production propagationizability tooling.'
}
