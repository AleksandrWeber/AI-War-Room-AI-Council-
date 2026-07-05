import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const exportizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExportizabilityRolloutCheckStatus = z.infer<
  typeof exportizabilityRolloutCheckStatusSchema
>

export const exportizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: exportizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExportizabilityRolloutCheck = z.infer<typeof exportizabilityRolloutCheckSchema>

export const exportizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExportizabilityRolloutStatus = z.infer<typeof exportizabilityRolloutStatusSchema>

export const exportizabilityCapabilitiesResponseSchema = z.object({
  supportsExportizabilityRollout: z.literal(true),
  supportsExportizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitExportizabilitySignals: z.literal(true),
  supportsUsageEventExportizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExportizabilityCapabilitiesResponse = z.infer<
  typeof exportizabilityCapabilitiesResponseSchema
>

export const exportizabilityRolloutResponseSchema = z.object({
  status: exportizabilityRolloutStatusSchema,
  checks: z.array(exportizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExportizabilityRolloutResponse = z.infer<
  typeof exportizabilityRolloutResponseSchema
>

export function getExportizabilityRolloutGuidance() {
  return 'Production exportizability rollout validates workspace limit exportizability, usage event exportizability signals, billing record coverage, and exportization readiness before production exportizability tooling.'
}
