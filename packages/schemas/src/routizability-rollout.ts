import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const routizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RoutizabilityRolloutCheckStatus = z.infer<
  typeof routizabilityRolloutCheckStatusSchema
>

export const routizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: routizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RoutizabilityRolloutCheck = z.infer<typeof routizabilityRolloutCheckSchema>

export const routizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RoutizabilityRolloutStatus = z.infer<typeof routizabilityRolloutStatusSchema>

export const routizabilityCapabilitiesResponseSchema = z.object({
  supportsRoutizabilityRollout: z.literal(true),
  supportsRoutizabilityAdminTools: z.literal(true),
  supportsShieldScanRoutizabilitySignals: z.literal(true),
  supportsProviderCredentialRoutizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RoutizabilityCapabilitiesResponse = z.infer<
  typeof routizabilityCapabilitiesResponseSchema
>

export const routizabilityRolloutResponseSchema = z.object({
  status: routizabilityRolloutStatusSchema,
  checks: z.array(routizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RoutizabilityRolloutResponse = z.infer<
  typeof routizabilityRolloutResponseSchema
>

export function getRoutizabilityRolloutGuidance() {
  return 'Production routizability rollout validates shield scan routizability, provider credential routizability signals, billing webhook coverage, and routization readiness before production routizability tooling.'
}
