import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const importizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ImportizabilityRolloutCheckStatus = z.infer<
  typeof importizabilityRolloutCheckStatusSchema
>

export const importizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: importizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ImportizabilityRolloutCheck = z.infer<typeof importizabilityRolloutCheckSchema>

export const importizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ImportizabilityRolloutStatus = z.infer<typeof importizabilityRolloutStatusSchema>

export const importizabilityCapabilitiesResponseSchema = z.object({
  supportsImportizabilityRollout: z.literal(true),
  supportsImportizabilityAdminTools: z.literal(true),
  supportsProviderCredentialImportizabilitySignals: z.literal(true),
  supportsModelRegistryImportizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ImportizabilityCapabilitiesResponse = z.infer<
  typeof importizabilityCapabilitiesResponseSchema
>

export const importizabilityRolloutResponseSchema = z.object({
  status: importizabilityRolloutStatusSchema,
  checks: z.array(importizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ImportizabilityRolloutResponse = z.infer<
  typeof importizabilityRolloutResponseSchema
>

export function getImportizabilityRolloutGuidance() {
  return 'Production importizability rollout validates provider credential importizability, model registry importizability signals, billing webhook coverage, and importization readiness before production importizability tooling.'
}
