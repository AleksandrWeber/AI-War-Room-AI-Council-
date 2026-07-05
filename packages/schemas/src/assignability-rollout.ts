import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assignabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssignabilityRolloutCheckStatus = z.infer<
  typeof assignabilityRolloutCheckStatusSchema
>

export const assignabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assignabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssignabilityRolloutCheck = z.infer<typeof assignabilityRolloutCheckSchema>

export const assignabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssignabilityRolloutStatus = z.infer<typeof assignabilityRolloutStatusSchema>

export const assignabilityCapabilitiesResponseSchema = z.object({
  supportsAssignabilityRollout: z.literal(true),
  supportsAssignabilityAdminTools: z.literal(true),
  supportsWorkspaceMembershipAssignabilitySignals: z.literal(true),
  supportsProviderCredentialAssignabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssignabilityCapabilitiesResponse = z.infer<
  typeof assignabilityCapabilitiesResponseSchema
>

export const assignabilityRolloutResponseSchema = z.object({
  status: assignabilityRolloutStatusSchema,
  checks: z.array(assignabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssignabilityRolloutResponse = z.infer<
  typeof assignabilityRolloutResponseSchema
>

export function getAssignabilityRolloutGuidance() {
  return 'Production assignability rollout validates workspace membership assignability, provider credential assignability signals, billing notification coverage, and assignment readiness before production assignability tooling.'
}
