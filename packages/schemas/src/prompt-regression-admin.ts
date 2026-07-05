import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const promptRegressionAdminCaseSchema = z.object({
  caseId: nonEmptyStringSchema,
  expectedPromptVersion: nonEmptyStringSchema,
  actualPromptVersion: nonEmptyStringSchema,
  schemaValid: z.boolean(),
  clarityScore: z.number().min(0).max(1),
  usefulnessScore: z.number().min(0).max(1),
  promptVersionChanged: z.boolean(),
  passed: z.boolean(),
})
export type PromptRegressionAdminCase = z.infer<
  typeof promptRegressionAdminCaseSchema
>

export const promptRegressionAdminStatsSchema = z.object({
  totalCases: z.number().int().nonnegative(),
  passedCases: z.number().int().nonnegative(),
  failedCases: z.number().int().nonnegative(),
  promptVersionDriftCount: z.number().int().nonnegative(),
  schemaInvalidCount: z.number().int().nonnegative(),
})
export type PromptRegressionAdminStats = z.infer<
  typeof promptRegressionAdminStatsSchema
>

export const promptRegressionAdminActionSchema = z.enum(['rerun_prompt_regression'])
export type PromptRegressionAdminAction = z.infer<
  typeof promptRegressionAdminActionSchema
>

export const promptRegressionAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  cases: z.array(promptRegressionAdminCaseSchema),
  stats: promptRegressionAdminStatsSchema,
  availableActions: z.array(promptRegressionAdminActionSchema),
  guidance: nonEmptyStringSchema,
  generatedAt: nonEmptyStringSchema,
})
export type PromptRegressionAdminSummaryResponse = z.infer<
  typeof promptRegressionAdminSummaryResponseSchema
>

export const promptRegressionAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: promptRegressionAdminActionSchema,
})
export type PromptRegressionAdminActionRequest = z.infer<
  typeof promptRegressionAdminActionRequestSchema
>

export const promptRegressionAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: promptRegressionAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: promptRegressionAdminStatsSchema.optional(),
})
export type PromptRegressionAdminActionResponse = z.infer<
  typeof promptRegressionAdminActionResponseSchema
>
