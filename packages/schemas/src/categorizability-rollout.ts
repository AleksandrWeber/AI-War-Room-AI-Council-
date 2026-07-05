import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const categorizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CategorizabilityRolloutCheckStatus = z.infer<
  typeof categorizabilityRolloutCheckStatusSchema
>

export const categorizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: categorizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CategorizabilityRolloutCheck = z.infer<typeof categorizabilityRolloutCheckSchema>

export const categorizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CategorizabilityRolloutStatus = z.infer<typeof categorizabilityRolloutStatusSchema>

export const categorizabilityCapabilitiesResponseSchema = z.object({
  supportsCategorizabilityRollout: z.literal(true),
  supportsCategorizabilityAdminTools: z.literal(true),
  supportsModelHealthCategorizabilitySignals: z.literal(true),
  supportsModelRegistryCategorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CategorizabilityCapabilitiesResponse = z.infer<
  typeof categorizabilityCapabilitiesResponseSchema
>

export const categorizabilityRolloutResponseSchema = z.object({
  status: categorizabilityRolloutStatusSchema,
  checks: z.array(categorizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CategorizabilityRolloutResponse = z.infer<
  typeof categorizabilityRolloutResponseSchema
>

export function getCategorizabilityRolloutGuidance() {
  return 'Production categorizability rollout validates model health categorizability, model registry categorizability signals, billing record coverage, and categorization readiness before production categorizability tooling.'
}
