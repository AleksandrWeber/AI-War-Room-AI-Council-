import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const routingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RoutingizabilityRolloutCheckStatus = z.infer<
  typeof routingizabilityRolloutCheckStatusSchema
>

export const routingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: routingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RoutingizabilityRolloutCheck = z.infer<typeof routingizabilityRolloutCheckSchema>

export const routingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RoutingizabilityRolloutStatus = z.infer<typeof routingizabilityRolloutStatusSchema>

export const routingizabilityCapabilitiesResponseSchema = z.object({
  supportsRoutingizabilityRollout: z.literal(true),
  supportsRoutingizabilityAdminTools: z.literal(true),
  supportsProviderCredentialRoutingizabilitySignals: z.literal(true),
  supportsModelRegistryRoutingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RoutingizabilityCapabilitiesResponse = z.infer<
  typeof routingizabilityCapabilitiesResponseSchema
>

export const routingizabilityRolloutResponseSchema = z.object({
  status: routingizabilityRolloutStatusSchema,
  checks: z.array(routingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RoutingizabilityRolloutResponse = z.infer<
  typeof routingizabilityRolloutResponseSchema
>

export function getRoutingizabilityRolloutGuidance() {
  return 'Production routingizability rollout validates provider credential routingizability, model registry routingizability signals, billing webhook coverage, and routingization readiness before production routingizability tooling.'
}
