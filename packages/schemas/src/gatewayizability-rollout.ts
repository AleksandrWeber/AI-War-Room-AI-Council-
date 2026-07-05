import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const gatewayizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GatewayizabilityRolloutCheckStatus = z.infer<
  typeof gatewayizabilityRolloutCheckStatusSchema
>

export const gatewayizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: gatewayizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GatewayizabilityRolloutCheck = z.infer<typeof gatewayizabilityRolloutCheckSchema>

export const gatewayizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GatewayizabilityRolloutStatus = z.infer<typeof gatewayizabilityRolloutStatusSchema>

export const gatewayizabilityCapabilitiesResponseSchema = z.object({
  supportsGatewayizabilityRollout: z.literal(true),
  supportsGatewayizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitGatewayizabilitySignals: z.literal(true),
  supportsUsageEventGatewayizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GatewayizabilityCapabilitiesResponse = z.infer<
  typeof gatewayizabilityCapabilitiesResponseSchema
>

export const gatewayizabilityRolloutResponseSchema = z.object({
  status: gatewayizabilityRolloutStatusSchema,
  checks: z.array(gatewayizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GatewayizabilityRolloutResponse = z.infer<
  typeof gatewayizabilityRolloutResponseSchema
>

export function getGatewayizabilityRolloutGuidance() {
  return 'Production gatewayizability rollout validates workspace limit gatewayizability, usage event gatewayizability signals, billing record coverage, and gatewayization readiness before production gatewayizability tooling.'
}
