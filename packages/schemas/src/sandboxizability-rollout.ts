import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const sandboxizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SandboxizabilityRolloutCheckStatus = z.infer<
  typeof sandboxizabilityRolloutCheckStatusSchema
>

export const sandboxizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: sandboxizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SandboxizabilityRolloutCheck = z.infer<typeof sandboxizabilityRolloutCheckSchema>

export const sandboxizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SandboxizabilityRolloutStatus = z.infer<typeof sandboxizabilityRolloutStatusSchema>

export const sandboxizabilityCapabilitiesResponseSchema = z.object({
  supportsSandboxizabilityRollout: z.literal(true),
  supportsSandboxizabilityAdminTools: z.literal(true),
  supportsMembershipSandboxizabilitySignals: z.literal(true),
  supportsUsageEventSandboxizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SandboxizabilityCapabilitiesResponse = z.infer<
  typeof sandboxizabilityCapabilitiesResponseSchema
>

export const sandboxizabilityRolloutResponseSchema = z.object({
  status: sandboxizabilityRolloutStatusSchema,
  checks: z.array(sandboxizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SandboxizabilityRolloutResponse = z.infer<
  typeof sandboxizabilityRolloutResponseSchema
>

export function getSandboxizabilityRolloutGuidance() {
  return 'Production sandboxizability rollout validates membership sandboxizability, usage event sandboxizability signals, billing notification coverage, and sandboxization readiness before production sandboxizability tooling.'
}
