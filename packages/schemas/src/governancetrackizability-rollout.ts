import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const governancetrackizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GovernancetrackizabilityRolloutCheckStatus = z.infer<
  typeof governancetrackizabilityRolloutCheckStatusSchema
>

export const governancetrackizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: governancetrackizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GovernancetrackizabilityRolloutCheck = z.infer<typeof governancetrackizabilityRolloutCheckSchema>

export const governancetrackizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GovernancetrackizabilityRolloutStatus = z.infer<typeof governancetrackizabilityRolloutStatusSchema>

export const governancetrackizabilityCapabilitiesResponseSchema = z.object({
  supportsGovernancetrackizabilityRollout: z.literal(true),
  supportsGovernancetrackizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceGovernancetrackizabilitySignals: z.literal(true),
  supportsBillingRecordGovernancetrackizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GovernancetrackizabilityCapabilitiesResponse = z.infer<
  typeof governancetrackizabilityCapabilitiesResponseSchema
>

export const governancetrackizabilityRolloutResponseSchema = z.object({
  status: governancetrackizabilityRolloutStatusSchema,
  checks: z.array(governancetrackizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GovernancetrackizabilityRolloutResponse = z.infer<
  typeof governancetrackizabilityRolloutResponseSchema
>

export function getGovernancetrackizabilityRolloutGuidance() {
  return 'Production governancetrackizability rollout validates billing invoice governancetrackizability, billing record governancetrackizability signals, billing webhook coverage, and scalingization readiness before production governancetrackizability tooling.'
}
