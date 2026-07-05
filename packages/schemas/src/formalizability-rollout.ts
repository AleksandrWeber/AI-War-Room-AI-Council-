import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const formalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FormalizabilityRolloutCheckStatus = z.infer<
  typeof formalizabilityRolloutCheckStatusSchema
>

export const formalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: formalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FormalizabilityRolloutCheck = z.infer<typeof formalizabilityRolloutCheckSchema>

export const formalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FormalizabilityRolloutStatus = z.infer<typeof formalizabilityRolloutStatusSchema>

export const formalizabilityCapabilitiesResponseSchema = z.object({
  supportsFormalizabilityRollout: z.literal(true),
  supportsFormalizabilityAdminTools: z.literal(true),
  supportsProviderCredentialFormalizabilitySignals: z.literal(true),
  supportsModelRegistryFormalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FormalizabilityCapabilitiesResponse = z.infer<
  typeof formalizabilityCapabilitiesResponseSchema
>

export const formalizabilityRolloutResponseSchema = z.object({
  status: formalizabilityRolloutStatusSchema,
  checks: z.array(formalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FormalizabilityRolloutResponse = z.infer<
  typeof formalizabilityRolloutResponseSchema
>

export function getFormalizabilityRolloutGuidance() {
  return 'Production formalizability rollout validates provider credential formalizability, model registry formalizability signals, billing webhook coverage, and formalization readiness before production formalizability tooling.'
}
