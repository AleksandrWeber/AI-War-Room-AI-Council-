import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const indexingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IndexingizabilityRolloutCheckStatus = z.infer<
  typeof indexingizabilityRolloutCheckStatusSchema
>

export const indexingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: indexingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IndexingizabilityRolloutCheck = z.infer<typeof indexingizabilityRolloutCheckSchema>

export const indexingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IndexingizabilityRolloutStatus = z.infer<typeof indexingizabilityRolloutStatusSchema>

export const indexingizabilityCapabilitiesResponseSchema = z.object({
  supportsIndexingizabilityRollout: z.literal(true),
  supportsIndexingizabilityAdminTools: z.literal(true),
  supportsModelHealthIndexingizabilitySignals: z.literal(true),
  supportsModelRegistryIndexingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IndexingizabilityCapabilitiesResponse = z.infer<
  typeof indexingizabilityCapabilitiesResponseSchema
>

export const indexingizabilityRolloutResponseSchema = z.object({
  status: indexingizabilityRolloutStatusSchema,
  checks: z.array(indexingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IndexingizabilityRolloutResponse = z.infer<
  typeof indexingizabilityRolloutResponseSchema
>

export function getIndexingizabilityRolloutGuidance() {
  return 'Production indexingizability rollout validates model health indexingizability, model registry indexingizability signals, billing record coverage, and optimization readiness before production indexingizability tooling.'
}
