import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const extensibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExtensibilityRolloutCheckStatus = z.infer<
  typeof extensibilityRolloutCheckStatusSchema
>

export const extensibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: extensibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExtensibilityRolloutCheck = z.infer<typeof extensibilityRolloutCheckSchema>

export const extensibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExtensibilityRolloutStatus = z.infer<typeof extensibilityRolloutStatusSchema>

export const extensibilityCapabilitiesResponseSchema = z.object({
  supportsExtensibilityRollout: z.literal(true),
  supportsExtensibilityAdminTools: z.literal(true),
  supportsAgentOutputExtensibilitySignals: z.literal(true),
  supportsArtifactExtensibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExtensibilityCapabilitiesResponse = z.infer<
  typeof extensibilityCapabilitiesResponseSchema
>

export const extensibilityRolloutResponseSchema = z.object({
  status: extensibilityRolloutStatusSchema,
  checks: z.array(extensibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExtensibilityRolloutResponse = z.infer<
  typeof extensibilityRolloutResponseSchema
>

export function getExtensibilityRolloutGuidance() {
  return 'Production extensibility rollout validates agent output extensibility, artifact extensibility signals, synthesis coverage, and extension readiness before production extensibility tooling.'
}
