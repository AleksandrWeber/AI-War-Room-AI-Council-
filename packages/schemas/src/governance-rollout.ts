import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const governanceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GovernanceRolloutCheckStatus = z.infer<
  typeof governanceRolloutCheckStatusSchema
>

export const governanceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: governanceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GovernanceRolloutCheck = z.infer<typeof governanceRolloutCheckSchema>

export const governanceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GovernanceRolloutStatus = z.infer<
  typeof governanceRolloutStatusSchema
>

export const governanceCapabilitiesResponseSchema = z.object({
  supportsGovernanceRollout: z.literal(true),
  supportsGovernanceAdminTools: z.literal(true),
  supportsAccessGovernanceSignals: z.literal(true),
  supportsCredentialGovernanceSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GovernanceCapabilitiesResponse = z.infer<
  typeof governanceCapabilitiesResponseSchema
>

export const governanceRolloutResponseSchema = z.object({
  status: governanceRolloutStatusSchema,
  checks: z.array(governanceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GovernanceRolloutResponse = z.infer<
  typeof governanceRolloutResponseSchema
>

export function getGovernanceRolloutGuidance() {
  return 'Production governance rollout validates access governance, credential governance, shield policy coverage, and policy readiness before production governance tooling.'
}
