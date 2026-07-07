import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const identityproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IdentityproofizabilityRolloutCheckStatus = z.infer<
  typeof identityproofizabilityRolloutCheckStatusSchema
>

export const identityproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: identityproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IdentityproofizabilityRolloutCheck = z.infer<typeof identityproofizabilityRolloutCheckSchema>

export const identityproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IdentityproofizabilityRolloutStatus = z.infer<typeof identityproofizabilityRolloutStatusSchema>

export const identityproofizabilityCapabilitiesResponseSchema = z.object({
  supportsIdentityproofizabilityRollout: z.literal(true),
  supportsIdentityproofizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceIdentityproofizabilitySignals: z.literal(true),
  supportsBillingRecordIdentityproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IdentityproofizabilityCapabilitiesResponse = z.infer<
  typeof identityproofizabilityCapabilitiesResponseSchema
>

export const identityproofizabilityRolloutResponseSchema = z.object({
  status: identityproofizabilityRolloutStatusSchema,
  checks: z.array(identityproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IdentityproofizabilityRolloutResponse = z.infer<
  typeof identityproofizabilityRolloutResponseSchema
>

export function getIdentityproofizabilityRolloutGuidance() {
  return 'Production identityproofizability rollout validates billing invoice identityproofizability, billing record identityproofizability signals, billing webhook coverage, and scalingization readiness before production identityproofizability tooling.'
}
