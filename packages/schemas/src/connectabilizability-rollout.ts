import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const connectabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConnectabilizabilityRolloutCheckStatus = z.infer<
  typeof connectabilizabilityRolloutCheckStatusSchema
>

export const connectabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: connectabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConnectabilizabilityRolloutCheck = z.infer<typeof connectabilizabilityRolloutCheckSchema>

export const connectabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConnectabilizabilityRolloutStatus = z.infer<typeof connectabilizabilityRolloutStatusSchema>

export const connectabilizabilityCapabilitiesResponseSchema = z.object({
  supportsConnectabilizabilityRollout: z.literal(true),
  supportsConnectabilizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitConnectabilizabilitySignals: z.literal(true),
  supportsUsageEventConnectabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConnectabilizabilityCapabilitiesResponse = z.infer<
  typeof connectabilizabilityCapabilitiesResponseSchema
>

export const connectabilizabilityRolloutResponseSchema = z.object({
  status: connectabilizabilityRolloutStatusSchema,
  checks: z.array(connectabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConnectabilizabilityRolloutResponse = z.infer<
  typeof connectabilizabilityRolloutResponseSchema
>

export function getConnectabilizabilityRolloutGuidance() {
  return 'Production connectabilizability rollout validates workspace limit connectabilizability, usage event connectabilizability signals, billing record coverage, and connectabilization readiness before production connectabilizability tooling.'
}
