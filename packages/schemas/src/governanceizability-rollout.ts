import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const governanceizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GovernanceizabilityRolloutCheckStatus = z.infer<
  typeof governanceizabilityRolloutCheckStatusSchema
>

export const governanceizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: governanceizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GovernanceizabilityRolloutCheck = z.infer<typeof governanceizabilityRolloutCheckSchema>

export const governanceizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GovernanceizabilityRolloutStatus = z.infer<typeof governanceizabilityRolloutStatusSchema>

export const governanceizabilityCapabilitiesResponseSchema = z.object({
  supportsGovernanceizabilityRollout: z.literal(true),
  supportsGovernanceizabilityAdminTools: z.literal(true),
  supportsBillingNotificationGovernanceizabilitySignals: z.literal(true),
  supportsBillingWebhookGovernanceizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GovernanceizabilityCapabilitiesResponse = z.infer<
  typeof governanceizabilityCapabilitiesResponseSchema
>

export const governanceizabilityRolloutResponseSchema = z.object({
  status: governanceizabilityRolloutStatusSchema,
  checks: z.array(governanceizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GovernanceizabilityRolloutResponse = z.infer<
  typeof governanceizabilityRolloutResponseSchema
>

export function getGovernanceizabilityRolloutGuidance() {
  return 'Production governanceizability rollout validates billing notification governanceizability, billing webhook governanceizability signals, usage event coverage, and governanceization readiness before production governanceizability tooling.'
}
