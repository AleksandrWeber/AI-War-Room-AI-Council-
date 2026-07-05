import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const demonstrabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DemonstrabilityRolloutCheckStatus = z.infer<
  typeof demonstrabilityRolloutCheckStatusSchema
>

export const demonstrabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: demonstrabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DemonstrabilityRolloutCheck = z.infer<typeof demonstrabilityRolloutCheckSchema>

export const demonstrabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DemonstrabilityRolloutStatus = z.infer<typeof demonstrabilityRolloutStatusSchema>

export const demonstrabilityCapabilitiesResponseSchema = z.object({
  supportsDemonstrabilityRollout: z.literal(true),
  supportsDemonstrabilityAdminTools: z.literal(true),
  supportsWorkflowDemonstrabilitySignals: z.literal(true),
  supportsArtifactDemonstrabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DemonstrabilityCapabilitiesResponse = z.infer<
  typeof demonstrabilityCapabilitiesResponseSchema
>

export const demonstrabilityRolloutResponseSchema = z.object({
  status: demonstrabilityRolloutStatusSchema,
  checks: z.array(demonstrabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DemonstrabilityRolloutResponse = z.infer<
  typeof demonstrabilityRolloutResponseSchema
>

export function getDemonstrabilityRolloutGuidance() {
  return 'Production demonstrability rollout validates workflow demonstrability, artifact demonstrability signals, billing notification coverage, and presentation readiness before production demonstrability tooling.'
}
