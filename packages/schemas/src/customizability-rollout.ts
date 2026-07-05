import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const customizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CustomizabilityRolloutCheckStatus = z.infer<
  typeof customizabilityRolloutCheckStatusSchema
>

export const customizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: customizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CustomizabilityRolloutCheck = z.infer<typeof customizabilityRolloutCheckSchema>

export const customizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CustomizabilityRolloutStatus = z.infer<typeof customizabilityRolloutStatusSchema>

export const customizabilityCapabilitiesResponseSchema = z.object({
  supportsCustomizabilityRollout: z.literal(true),
  supportsCustomizabilityAdminTools: z.literal(true),
  supportsWorkflowCustomizabilitySignals: z.literal(true),
  supportsArtifactCustomizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CustomizabilityCapabilitiesResponse = z.infer<
  typeof customizabilityCapabilitiesResponseSchema
>

export const customizabilityRolloutResponseSchema = z.object({
  status: customizabilityRolloutStatusSchema,
  checks: z.array(customizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CustomizabilityRolloutResponse = z.infer<
  typeof customizabilityRolloutResponseSchema
>

export function getCustomizabilityRolloutGuidance() {
  return 'Production customizability rollout validates workflow customizability, artifact customizability signals, usage event coverage, and customization readiness before production customizability tooling.'
}
