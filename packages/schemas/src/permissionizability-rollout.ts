import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const permissionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PermissionizabilityRolloutCheckStatus = z.infer<
  typeof permissionizabilityRolloutCheckStatusSchema
>

export const permissionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: permissionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PermissionizabilityRolloutCheck = z.infer<typeof permissionizabilityRolloutCheckSchema>

export const permissionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PermissionizabilityRolloutStatus = z.infer<typeof permissionizabilityRolloutStatusSchema>

export const permissionizabilityCapabilitiesResponseSchema = z.object({
  supportsPermissionizabilityRollout: z.literal(true),
  supportsPermissionizabilityAdminTools: z.literal(true),
  supportsMembershipPermissionizabilitySignals: z.literal(true),
  supportsUsageEventPermissionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PermissionizabilityCapabilitiesResponse = z.infer<
  typeof permissionizabilityCapabilitiesResponseSchema
>

export const permissionizabilityRolloutResponseSchema = z.object({
  status: permissionizabilityRolloutStatusSchema,
  checks: z.array(permissionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PermissionizabilityRolloutResponse = z.infer<
  typeof permissionizabilityRolloutResponseSchema
>

export function getPermissionizabilityRolloutGuidance() {
  return 'Production permissionizability rollout validates membership permissionizability, usage event permissionizability signals, billing notification coverage, and healingization readiness before production permissionizability tooling.'
}
