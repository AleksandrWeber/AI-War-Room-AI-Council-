import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compatibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompatibilityRolloutCheckStatus = z.infer<
  typeof compatibilityRolloutCheckStatusSchema
>

export const compatibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compatibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompatibilityRolloutCheck = z.infer<typeof compatibilityRolloutCheckSchema>

export const compatibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompatibilityRolloutStatus = z.infer<typeof compatibilityRolloutStatusSchema>

export const compatibilityCapabilitiesResponseSchema = z.object({
  supportsCompatibilityRollout: z.literal(true),
  supportsCompatibilityAdminTools: z.literal(true),
  supportsProviderCredentialCompatibilitySignals: z.literal(true),
  supportsWorkspaceLimitCompatibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompatibilityCapabilitiesResponse = z.infer<
  typeof compatibilityCapabilitiesResponseSchema
>

export const compatibilityRolloutResponseSchema = z.object({
  status: compatibilityRolloutStatusSchema,
  checks: z.array(compatibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompatibilityRolloutResponse = z.infer<
  typeof compatibilityRolloutResponseSchema
>

export function getCompatibilityRolloutGuidance() {
  return 'Production compatibility rollout validates provider credential compatibility, workspace limit compatibility signals, billing record coverage, and compatibility readiness before production compatibility tooling.'
}
