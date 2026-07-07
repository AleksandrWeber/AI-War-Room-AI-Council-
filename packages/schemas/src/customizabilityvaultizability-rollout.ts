import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const customizabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CustomizabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof customizabilityvaultizabilityRolloutCheckStatusSchema
>

export const customizabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: customizabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CustomizabilityvaultizabilityRolloutCheck = z.infer<typeof customizabilityvaultizabilityRolloutCheckSchema>

export const customizabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CustomizabilityvaultizabilityRolloutStatus = z.infer<typeof customizabilityvaultizabilityRolloutStatusSchema>

export const customizabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsCustomizabilityvaultizabilityRollout: z.literal(true),
  supportsCustomizabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipCustomizabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventCustomizabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CustomizabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof customizabilityvaultizabilityCapabilitiesResponseSchema
>

export const customizabilityvaultizabilityRolloutResponseSchema = z.object({
  status: customizabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(customizabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CustomizabilityvaultizabilityRolloutResponse = z.infer<
  typeof customizabilityvaultizabilityRolloutResponseSchema
>

export function getCustomizabilityvaultizabilityRolloutGuidance() {
  return 'Production customizabilityvaultizability rollout validates membership customizabilityvaultizability, usage event customizabilityvaultizability signals, billing notification coverage, and healingization readiness before production customizabilityvaultizability tooling.'
}
