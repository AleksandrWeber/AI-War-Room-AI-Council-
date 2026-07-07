import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const adjustabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AdjustabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof adjustabilityvaultizabilityRolloutCheckStatusSchema
>

export const adjustabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: adjustabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AdjustabilityvaultizabilityRolloutCheck = z.infer<typeof adjustabilityvaultizabilityRolloutCheckSchema>

export const adjustabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AdjustabilityvaultizabilityRolloutStatus = z.infer<typeof adjustabilityvaultizabilityRolloutStatusSchema>

export const adjustabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAdjustabilityvaultizabilityRollout: z.literal(true),
  supportsAdjustabilityvaultizabilityAdminTools: z.literal(true),
  supportsBillingNotificationAdjustabilityvaultizabilitySignals: z.literal(true),
  supportsBillingWebhookAdjustabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AdjustabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof adjustabilityvaultizabilityCapabilitiesResponseSchema
>

export const adjustabilityvaultizabilityRolloutResponseSchema = z.object({
  status: adjustabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(adjustabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AdjustabilityvaultizabilityRolloutResponse = z.infer<
  typeof adjustabilityvaultizabilityRolloutResponseSchema
>

export function getAdjustabilityvaultizabilityRolloutGuidance() {
  return 'Production adjustabilityvaultizability rollout validates billing notification adjustabilityvaultizability, billing webhook adjustabilityvaultizability signals, usage event coverage, and governanceization readiness before production adjustabilityvaultizability tooling.'
}
