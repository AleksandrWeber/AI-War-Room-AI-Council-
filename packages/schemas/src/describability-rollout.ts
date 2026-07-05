import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const describabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DescribabilityRolloutCheckStatus = z.infer<
  typeof describabilityRolloutCheckStatusSchema
>

export const describabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: describabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DescribabilityRolloutCheck = z.infer<typeof describabilityRolloutCheckSchema>

export const describabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DescribabilityRolloutStatus = z.infer<typeof describabilityRolloutStatusSchema>

export const describabilityCapabilitiesResponseSchema = z.object({
  supportsDescribabilityRollout: z.literal(true),
  supportsDescribabilityAdminTools: z.literal(true),
  supportsWorkflowDescribabilitySignals: z.literal(true),
  supportsAgentOutputDescribabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DescribabilityCapabilitiesResponse = z.infer<
  typeof describabilityCapabilitiesResponseSchema
>

export const describabilityRolloutResponseSchema = z.object({
  status: describabilityRolloutStatusSchema,
  checks: z.array(describabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DescribabilityRolloutResponse = z.infer<
  typeof describabilityRolloutResponseSchema
>

export function getDescribabilityRolloutGuidance() {
  return 'Production describability rollout validates workflow describability, agent output describability signals, synthesis coverage, and description readiness before production describability tooling.'
}
