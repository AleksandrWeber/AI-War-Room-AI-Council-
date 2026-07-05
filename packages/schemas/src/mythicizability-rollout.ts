import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const mythicizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MythicizabilityRolloutCheckStatus = z.infer<
  typeof mythicizabilityRolloutCheckStatusSchema
>

export const mythicizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: mythicizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MythicizabilityRolloutCheck = z.infer<typeof mythicizabilityRolloutCheckSchema>

export const mythicizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MythicizabilityRolloutStatus = z.infer<typeof mythicizabilityRolloutStatusSchema>

export const mythicizabilityCapabilitiesResponseSchema = z.object({
  supportsMythicizabilityRollout: z.literal(true),
  supportsMythicizabilityAdminTools: z.literal(true),
  supportsArtifactMythicizabilitySignals: z.literal(true),
  supportsWorkflowMythicizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MythicizabilityCapabilitiesResponse = z.infer<
  typeof mythicizabilityCapabilitiesResponseSchema
>

export const mythicizabilityRolloutResponseSchema = z.object({
  status: mythicizabilityRolloutStatusSchema,
  checks: z.array(mythicizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MythicizabilityRolloutResponse = z.infer<
  typeof mythicizabilityRolloutResponseSchema
>

export function getMythicizabilityRolloutGuidance() {
  return 'Production mythicizability rollout validates artifact mythicizability, workflow mythicizability signals, billing notification coverage, and mythicization readiness before production mythicizability tooling.'
}
