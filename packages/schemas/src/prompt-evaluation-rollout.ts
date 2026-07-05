import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const promptEvaluationRolloutCheckStatusSchema = z.enum([
  'pass',
  'fail',
  'skip',
])
export type PromptEvaluationRolloutCheckStatus = z.infer<
  typeof promptEvaluationRolloutCheckStatusSchema
>

export const promptEvaluationRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: promptEvaluationRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PromptEvaluationRolloutCheck = z.infer<
  typeof promptEvaluationRolloutCheckSchema
>

export const promptEvaluationRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PromptEvaluationRolloutStatus = z.infer<
  typeof promptEvaluationRolloutStatusSchema
>

export const promptEvaluationCapabilitiesResponseSchema = z.object({
  supportsPromptEvaluationRollout: z.literal(true),
  supportsPromptRegressionAdminTools: z.literal(true),
  regressionDatasetCaseCount: z.number().int().nonnegative(),
  guidance: nonEmptyStringSchema,
})
export type PromptEvaluationCapabilitiesResponse = z.infer<
  typeof promptEvaluationCapabilitiesResponseSchema
>

export const promptEvaluationRolloutResponseSchema = z.object({
  status: promptEvaluationRolloutStatusSchema,
  checks: z.array(promptEvaluationRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PromptEvaluationRolloutResponse = z.infer<
  typeof promptEvaluationRolloutResponseSchema
>

export const minimumPromptRegressionCaseCount = 6

export function getPromptEvaluationRolloutGuidance() {
  return 'Prompt evaluation rollout validates regression dataset coverage, schema validity, and prompt version drift before production prompt changes.'
}
