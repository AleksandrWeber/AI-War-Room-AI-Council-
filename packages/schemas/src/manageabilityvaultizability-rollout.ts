import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const manageabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ManageabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof manageabilityvaultizabilityRolloutCheckStatusSchema
>

export const manageabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: manageabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ManageabilityvaultizabilityRolloutCheck = z.infer<typeof manageabilityvaultizabilityRolloutCheckSchema>

export const manageabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ManageabilityvaultizabilityRolloutStatus = z.infer<typeof manageabilityvaultizabilityRolloutStatusSchema>

export const manageabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsManageabilityvaultizabilityRollout: z.literal(true),
  supportsManageabilityvaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyManageabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventManageabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ManageabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof manageabilityvaultizabilityCapabilitiesResponseSchema
>

export const manageabilityvaultizabilityRolloutResponseSchema = z.object({
  status: manageabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(manageabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ManageabilityvaultizabilityRolloutResponse = z.infer<
  typeof manageabilityvaultizabilityRolloutResponseSchema
>

export function getManageabilityvaultizabilityRolloutGuidance() {
  return 'Production manageabilityvaultizability rollout validates idempotency key manageabilityvaultizability, usage event manageabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production manageabilityvaultizability tooling.'
}
