import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const pragmatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PragmatizabilityRolloutCheckStatus = z.infer<
  typeof pragmatizabilityRolloutCheckStatusSchema
>

export const pragmatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: pragmatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PragmatizabilityRolloutCheck = z.infer<typeof pragmatizabilityRolloutCheckSchema>

export const pragmatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PragmatizabilityRolloutStatus = z.infer<typeof pragmatizabilityRolloutStatusSchema>

export const pragmatizabilityCapabilitiesResponseSchema = z.object({
  supportsPragmatizabilityRollout: z.literal(true),
  supportsPragmatizabilityAdminTools: z.literal(true),
  supportsBillingNotificationPragmatizabilitySignals: z.literal(true),
  supportsBillingWebhookPragmatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PragmatizabilityCapabilitiesResponse = z.infer<
  typeof pragmatizabilityCapabilitiesResponseSchema
>

export const pragmatizabilityRolloutResponseSchema = z.object({
  status: pragmatizabilityRolloutStatusSchema,
  checks: z.array(pragmatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PragmatizabilityRolloutResponse = z.infer<
  typeof pragmatizabilityRolloutResponseSchema
>

export function getPragmatizabilityRolloutGuidance() {
  return 'Production pragmatizability rollout validates billing notification pragmatizability, billing webhook pragmatizability signals, usage event coverage, and pragmatic readiness before production pragmatizability tooling.'
}
