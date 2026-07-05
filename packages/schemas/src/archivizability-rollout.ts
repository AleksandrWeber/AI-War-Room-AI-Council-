import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const archivizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ArchivizabilityRolloutCheckStatus = z.infer<
  typeof archivizabilityRolloutCheckStatusSchema
>

export const archivizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: archivizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ArchivizabilityRolloutCheck = z.infer<typeof archivizabilityRolloutCheckSchema>

export const archivizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ArchivizabilityRolloutStatus = z.infer<typeof archivizabilityRolloutStatusSchema>

export const archivizabilityCapabilitiesResponseSchema = z.object({
  supportsArchivizabilityRollout: z.literal(true),
  supportsArchivizabilityAdminTools: z.literal(true),
  supportsBillingWebhookArchivizabilitySignals: z.literal(true),
  supportsBillingRecordArchivizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ArchivizabilityCapabilitiesResponse = z.infer<
  typeof archivizabilityCapabilitiesResponseSchema
>

export const archivizabilityRolloutResponseSchema = z.object({
  status: archivizabilityRolloutStatusSchema,
  checks: z.array(archivizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ArchivizabilityRolloutResponse = z.infer<
  typeof archivizabilityRolloutResponseSchema
>

export function getArchivizabilityRolloutGuidance() {
  return 'Production archivizability rollout validates billing webhook archivizability, billing record archivizability signals, usage event coverage, and archivization readiness before production archivizability tooling.'
}
