import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const autoscalingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AutoscalingizabilityRolloutCheckStatus = z.infer<
  typeof autoscalingizabilityRolloutCheckStatusSchema
>

export const autoscalingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: autoscalingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AutoscalingizabilityRolloutCheck = z.infer<typeof autoscalingizabilityRolloutCheckSchema>

export const autoscalingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AutoscalingizabilityRolloutStatus = z.infer<typeof autoscalingizabilityRolloutStatusSchema>

export const autoscalingizabilityCapabilitiesResponseSchema = z.object({
  supportsAutoscalingizabilityRollout: z.literal(true),
  supportsAutoscalingizabilityAdminTools: z.literal(true),
  supportsProviderCredentialAutoscalingizabilitySignals: z.literal(true),
  supportsModelRegistryAutoscalingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AutoscalingizabilityCapabilitiesResponse = z.infer<
  typeof autoscalingizabilityCapabilitiesResponseSchema
>

export const autoscalingizabilityRolloutResponseSchema = z.object({
  status: autoscalingizabilityRolloutStatusSchema,
  checks: z.array(autoscalingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AutoscalingizabilityRolloutResponse = z.infer<
  typeof autoscalingizabilityRolloutResponseSchema
>

export function getAutoscalingizabilityRolloutGuidance() {
  return 'Production autoscalingizability rollout validates provider credential autoscalingizability, model registry autoscalingizability signals, billing webhook coverage, and autoscalingization readiness before production autoscalingizability tooling.'
}
