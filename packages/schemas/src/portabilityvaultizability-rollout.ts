import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const portabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PortabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof portabilityvaultizabilityRolloutCheckStatusSchema
>

export const portabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: portabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PortabilityvaultizabilityRolloutCheck = z.infer<typeof portabilityvaultizabilityRolloutCheckSchema>

export const portabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PortabilityvaultizabilityRolloutStatus = z.infer<typeof portabilityvaultizabilityRolloutStatusSchema>

export const portabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsPortabilityvaultizabilityRollout: z.literal(true),
  supportsPortabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationPortabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookPortabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PortabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof portabilityvaultizabilityCapabilitiesResponseSchema
>

export const portabilityvaultizabilityRolloutResponseSchema = z.object({
  status: portabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(portabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PortabilityvaultizabilityRolloutResponse = z.infer<
  typeof portabilityvaultizabilityRolloutResponseSchema
>

export function getPortabilityvaultizabilityRolloutGuidance() {
  return 'Production portabilityvaultizability rollout validates billing notification portabilityvaultizability, billing webhook portabilityvaultizability signals, usage event coverage, and governanceization readiness before production portabilityvaultizability tooling.'
}
