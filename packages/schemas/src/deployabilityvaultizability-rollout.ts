import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deployabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeployabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof deployabilityvaultizabilityRolloutCheckStatusSchema
>

export const deployabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deployabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeployabilityvaultizabilityRolloutCheck = z.infer<typeof deployabilityvaultizabilityRolloutCheckSchema>

export const deployabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeployabilityvaultizabilityRolloutStatus = z.infer<typeof deployabilityvaultizabilityRolloutStatusSchema>

export const deployabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsDeployabilityvaultizabilityRollout: z.literal(true),
  supportsDeployabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipDeployabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventDeployabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeployabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof deployabilityvaultizabilityCapabilitiesResponseSchema
>

export const deployabilityvaultizabilityRolloutResponseSchema = z.object({
  status: deployabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(deployabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeployabilityvaultizabilityRolloutResponse = z.infer<
  typeof deployabilityvaultizabilityRolloutResponseSchema
>

export function getDeployabilityvaultizabilityRolloutGuidance() {
  return 'Production deployabilityvaultizability rollout validates membership deployabilityvaultizability, usage event deployabilityvaultizability signals, billing notification coverage, and healingization readiness before production deployabilityvaultizability tooling.'
}
