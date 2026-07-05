import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const portabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PortabilityRolloutCheckStatus = z.infer<
  typeof portabilityRolloutCheckStatusSchema
>

export const portabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: portabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PortabilityRolloutCheck = z.infer<typeof portabilityRolloutCheckSchema>

export const portabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PortabilityRolloutStatus = z.infer<typeof portabilityRolloutStatusSchema>

export const portabilityCapabilitiesResponseSchema = z.object({
  supportsPortabilityRollout: z.literal(true),
  supportsPortabilityAdminTools: z.literal(true),
  supportsArtifactPortabilitySignals: z.literal(true),
  supportsAgentOutputPortabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PortabilityCapabilitiesResponse = z.infer<
  typeof portabilityCapabilitiesResponseSchema
>

export const portabilityRolloutResponseSchema = z.object({
  status: portabilityRolloutStatusSchema,
  checks: z.array(portabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PortabilityRolloutResponse = z.infer<
  typeof portabilityRolloutResponseSchema
>

export function getPortabilityRolloutGuidance() {
  return 'Production portability rollout validates artifact portability, agent output portability signals, synthesis coverage, and portability readiness before production portability tooling.'
}
