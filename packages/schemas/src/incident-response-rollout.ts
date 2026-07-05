import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const incidentResponseRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type IncidentResponseRolloutCheckStatus = z.infer<
  typeof incidentResponseRolloutCheckStatusSchema
>

export const incidentResponseRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: incidentResponseRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IncidentResponseRolloutCheck = z.infer<
  typeof incidentResponseRolloutCheckSchema
>

export const incidentResponseRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IncidentResponseRolloutStatus = z.infer<
  typeof incidentResponseRolloutStatusSchema
>

export const incidentResponseCapabilitiesResponseSchema = z.object({
  supportsIncidentResponseRollout: z.literal(true),
  supportsIncidentAdminTools: z.literal(true),
  supportsBillingAlertEscalation: z.literal(true),
  supportsObservabilityIncidentBuffer: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IncidentResponseCapabilitiesResponse = z.infer<
  typeof incidentResponseCapabilitiesResponseSchema
>

export const incidentResponseRolloutResponseSchema = z.object({
  status: incidentResponseRolloutStatusSchema,
  checks: z.array(incidentResponseRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IncidentResponseRolloutResponse = z.infer<
  typeof incidentResponseRolloutResponseSchema
>

export function getIncidentResponseRolloutGuidance() {
  return 'Production incident response rollout validates incident signal tables, billing alert escalation, and observability buffers before escalation-ready operations.'
}
