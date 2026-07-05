import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const archiveizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ArchiveizabilityRolloutCheckStatus = z.infer<
  typeof archiveizabilityRolloutCheckStatusSchema
>

export const archiveizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: archiveizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ArchiveizabilityRolloutCheck = z.infer<typeof archiveizabilityRolloutCheckSchema>

export const archiveizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ArchiveizabilityRolloutStatus = z.infer<typeof archiveizabilityRolloutStatusSchema>

export const archiveizabilityCapabilitiesResponseSchema = z.object({
  supportsArchiveizabilityRollout: z.literal(true),
  supportsArchiveizabilityAdminTools: z.literal(true),
  supportsBillingNotificationArchiveizabilitySignals: z.literal(true),
  supportsBillingWebhookArchiveizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ArchiveizabilityCapabilitiesResponse = z.infer<
  typeof archiveizabilityCapabilitiesResponseSchema
>

export const archiveizabilityRolloutResponseSchema = z.object({
  status: archiveizabilityRolloutStatusSchema,
  checks: z.array(archiveizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ArchiveizabilityRolloutResponse = z.infer<
  typeof archiveizabilityRolloutResponseSchema
>

export function getArchiveizabilityRolloutGuidance() {
  return 'Production archiveizability rollout validates billing notification archiveizability, billing webhook archiveizability signals, usage event coverage, and archiveization readiness before production archiveizability tooling.'
}
