import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const linkabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LinkabilityRolloutCheckStatus = z.infer<
  typeof linkabilityRolloutCheckStatusSchema
>

export const linkabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: linkabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LinkabilityRolloutCheck = z.infer<typeof linkabilityRolloutCheckSchema>

export const linkabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LinkabilityRolloutStatus = z.infer<typeof linkabilityRolloutStatusSchema>

export const linkabilityCapabilitiesResponseSchema = z.object({
  supportsLinkabilityRollout: z.literal(true),
  supportsLinkabilityAdminTools: z.literal(true),
  supportsWorkflowLinkabilitySignals: z.literal(true),
  supportsArtifactLinkabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LinkabilityCapabilitiesResponse = z.infer<
  typeof linkabilityCapabilitiesResponseSchema
>

export const linkabilityRolloutResponseSchema = z.object({
  status: linkabilityRolloutStatusSchema,
  checks: z.array(linkabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LinkabilityRolloutResponse = z.infer<
  typeof linkabilityRolloutResponseSchema
>

export function getLinkabilityRolloutGuidance() {
  return 'Production linkability rollout validates workflow linkability, artifact linkability signals, billing record coverage, and link readiness before production linkability tooling.'
}
