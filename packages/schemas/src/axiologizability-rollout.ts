import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const axiologizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AxiologizabilityRolloutCheckStatus = z.infer<
  typeof axiologizabilityRolloutCheckStatusSchema
>

export const axiologizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: axiologizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AxiologizabilityRolloutCheck = z.infer<typeof axiologizabilityRolloutCheckSchema>

export const axiologizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AxiologizabilityRolloutStatus = z.infer<typeof axiologizabilityRolloutStatusSchema>

export const axiologizabilityCapabilitiesResponseSchema = z.object({
  supportsAxiologizabilityRollout: z.literal(true),
  supportsAxiologizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAxiologizabilitySignals: z.literal(true),
  supportsBillingWebhookAxiologizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AxiologizabilityCapabilitiesResponse = z.infer<
  typeof axiologizabilityCapabilitiesResponseSchema
>

export const axiologizabilityRolloutResponseSchema = z.object({
  status: axiologizabilityRolloutStatusSchema,
  checks: z.array(axiologizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AxiologizabilityRolloutResponse = z.infer<
  typeof axiologizabilityRolloutResponseSchema
>

export function getAxiologizabilityRolloutGuidance() {
  return 'Production axiologizability rollout validates billing notification axiologizability, billing webhook axiologizability signals, usage event coverage, and axiologization readiness before production axiologizability tooling.'
}
