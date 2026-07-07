import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tracevaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TracevaultizabilityRolloutCheckStatus = z.infer<
  typeof tracevaultizabilityRolloutCheckStatusSchema
>

export const tracevaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tracevaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TracevaultizabilityRolloutCheck = z.infer<typeof tracevaultizabilityRolloutCheckSchema>

export const tracevaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TracevaultizabilityRolloutStatus = z.infer<typeof tracevaultizabilityRolloutStatusSchema>

export const tracevaultizabilityCapabilitiesResponseSchema = z.object({
  supportsTracevaultizabilityRollout: z.literal(true),
  supportsTracevaultizabilityAdminTools: z.literal(true),
  supportsMembershipTracevaultizabilitySignals: z.literal(true),
  supportsUsageEventTracevaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TracevaultizabilityCapabilitiesResponse = z.infer<
  typeof tracevaultizabilityCapabilitiesResponseSchema
>

export const tracevaultizabilityRolloutResponseSchema = z.object({
  status: tracevaultizabilityRolloutStatusSchema,
  checks: z.array(tracevaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TracevaultizabilityRolloutResponse = z.infer<
  typeof tracevaultizabilityRolloutResponseSchema
>

export function getTracevaultizabilityRolloutGuidance() {
  return 'Production tracevaultizability rollout validates membership tracevaultizability, usage event tracevaultizability signals, billing notification coverage, and healingization readiness before production tracevaultizability tooling.'
}
