import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assignabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssignabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof assignabilityvaultizabilityRolloutCheckStatusSchema
>

export const assignabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assignabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssignabilityvaultizabilityRolloutCheck = z.infer<typeof assignabilityvaultizabilityRolloutCheckSchema>

export const assignabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssignabilityvaultizabilityRolloutStatus = z.infer<typeof assignabilityvaultizabilityRolloutStatusSchema>

export const assignabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAssignabilityvaultizabilityRollout: z.literal(true),
  supportsAssignabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAssignabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookAssignabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssignabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof assignabilityvaultizabilityCapabilitiesResponseSchema
>

export const assignabilityvaultizabilityRolloutResponseSchema = z.object({
  status: assignabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(assignabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssignabilityvaultizabilityRolloutResponse = z.infer<
  typeof assignabilityvaultizabilityRolloutResponseSchema
>

export function getAssignabilityvaultizabilityRolloutGuidance() {
  return 'Production assignabilityvaultizability rollout validates billing notification assignabilityvaultizability, billing webhook assignabilityvaultizability signals, usage event coverage, and governanceization readiness before production assignabilityvaultizability tooling.'
}
