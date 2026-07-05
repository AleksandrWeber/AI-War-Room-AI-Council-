import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const syntacticizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SyntacticizabilityRolloutCheckStatus = z.infer<
  typeof syntacticizabilityRolloutCheckStatusSchema
>

export const syntacticizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: syntacticizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SyntacticizabilityRolloutCheck = z.infer<typeof syntacticizabilityRolloutCheckSchema>

export const syntacticizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SyntacticizabilityRolloutStatus = z.infer<typeof syntacticizabilityRolloutStatusSchema>

export const syntacticizabilityCapabilitiesResponseSchema = z.object({
  supportsSyntacticizabilityRollout: z.literal(true),
  supportsSyntacticizabilityAdminTools: z.literal(true),
  supportsBillingWebhookSyntacticizabilitySignals: z.literal(true),
  supportsBillingRecordSyntacticizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SyntacticizabilityCapabilitiesResponse = z.infer<
  typeof syntacticizabilityCapabilitiesResponseSchema
>

export const syntacticizabilityRolloutResponseSchema = z.object({
  status: syntacticizabilityRolloutStatusSchema,
  checks: z.array(syntacticizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SyntacticizabilityRolloutResponse = z.infer<
  typeof syntacticizabilityRolloutResponseSchema
>

export function getSyntacticizabilityRolloutGuidance() {
  return 'Production syntacticizability rollout validates billing webhook syntacticizability, billing record syntacticizability signals, usage event coverage, and syntacticization readiness before production syntacticizability tooling.'
}
