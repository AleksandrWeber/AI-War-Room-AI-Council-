import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const documentizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DocumentizabilityRolloutCheckStatus = z.infer<
  typeof documentizabilityRolloutCheckStatusSchema
>

export const documentizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: documentizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DocumentizabilityRolloutCheck = z.infer<typeof documentizabilityRolloutCheckSchema>

export const documentizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DocumentizabilityRolloutStatus = z.infer<typeof documentizabilityRolloutStatusSchema>

export const documentizabilityCapabilitiesResponseSchema = z.object({
  supportsDocumentizabilityRollout: z.literal(true),
  supportsDocumentizabilityAdminTools: z.literal(true),
  supportsMembershipDocumentizabilitySignals: z.literal(true),
  supportsUsageEventDocumentizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DocumentizabilityCapabilitiesResponse = z.infer<
  typeof documentizabilityCapabilitiesResponseSchema
>

export const documentizabilityRolloutResponseSchema = z.object({
  status: documentizabilityRolloutStatusSchema,
  checks: z.array(documentizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DocumentizabilityRolloutResponse = z.infer<
  typeof documentizabilityRolloutResponseSchema
>

export function getDocumentizabilityRolloutGuidance() {
  return 'Production documentizability rollout validates membership documentizability, usage event documentizability signals, billing notification coverage, and documentization readiness before production documentizability tooling.'
}
