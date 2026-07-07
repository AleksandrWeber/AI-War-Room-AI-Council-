import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const responsivenessvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ResponsivenessvaultizabilityRolloutCheckStatus = z.infer<
  typeof responsivenessvaultizabilityRolloutCheckStatusSchema
>

export const responsivenessvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: responsivenessvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ResponsivenessvaultizabilityRolloutCheck = z.infer<typeof responsivenessvaultizabilityRolloutCheckSchema>

export const responsivenessvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ResponsivenessvaultizabilityRolloutStatus = z.infer<typeof responsivenessvaultizabilityRolloutStatusSchema>

export const responsivenessvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsResponsivenessvaultizabilityRollout: z.literal(true),
  supportsResponsivenessvaultizabilityAdminTools: z.literal(true),
  supportsMembershipResponsivenessvaultizabilitySignals: z.literal(true),
  supportsUsageEventResponsivenessvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ResponsivenessvaultizabilityCapabilitiesResponse = z.infer<
  typeof responsivenessvaultizabilityCapabilitiesResponseSchema
>

export const responsivenessvaultizabilityRolloutResponseSchema = z.object({
  status: responsivenessvaultizabilityRolloutStatusSchema,
  checks: z.array(responsivenessvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ResponsivenessvaultizabilityRolloutResponse = z.infer<
  typeof responsivenessvaultizabilityRolloutResponseSchema
>

export function getResponsivenessvaultizabilityRolloutGuidance() {
  return 'Production responsivenessvaultizability rollout validates membership responsivenessvaultizability, usage event responsivenessvaultizability signals, billing notification coverage, and healingization readiness before production responsivenessvaultizability tooling.'
}
