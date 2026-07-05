import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const mirroringizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MirroringizabilityRolloutCheckStatus = z.infer<
  typeof mirroringizabilityRolloutCheckStatusSchema
>

export const mirroringizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: mirroringizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MirroringizabilityRolloutCheck = z.infer<typeof mirroringizabilityRolloutCheckSchema>

export const mirroringizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MirroringizabilityRolloutStatus = z.infer<typeof mirroringizabilityRolloutStatusSchema>

export const mirroringizabilityCapabilitiesResponseSchema = z.object({
  supportsMirroringizabilityRollout: z.literal(true),
  supportsMirroringizabilityAdminTools: z.literal(true),
  supportsMeterUsageMirroringizabilitySignals: z.literal(true),
  supportsUsageEventMirroringizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MirroringizabilityCapabilitiesResponse = z.infer<
  typeof mirroringizabilityCapabilitiesResponseSchema
>

export const mirroringizabilityRolloutResponseSchema = z.object({
  status: mirroringizabilityRolloutStatusSchema,
  checks: z.array(mirroringizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MirroringizabilityRolloutResponse = z.infer<
  typeof mirroringizabilityRolloutResponseSchema
>

export function getMirroringizabilityRolloutGuidance() {
  return 'Production mirroringizability rollout validates meter usage mirroringizability, usage event mirroringizability signals, workspace limit coverage, and mirroringization readiness before production mirroringizability tooling.'
}
