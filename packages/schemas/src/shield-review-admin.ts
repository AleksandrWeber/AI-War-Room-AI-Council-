import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { shieldStatusSchema } from './shield.js'
import { workspaceRoleSchema } from './workspace.js'

export const shieldReviewAdminCaseSchema = z.object({
  caseId: nonEmptyStringSchema,
  expectedStatus: shieldStatusSchema,
  actualStatus: shieldStatusSchema,
  passed: z.boolean(),
})
export type ShieldReviewAdminCase = z.infer<typeof shieldReviewAdminCaseSchema>

export const shieldReviewAdminStatsSchema = z.object({
  totalCases: z.number().int().nonnegative(),
  passedCases: z.number().int().nonnegative(),
  falsePositiveCount: z.number().int().nonnegative(),
  falsePositiveRate: z.number().min(0).max(1),
})
export type ShieldReviewAdminStats = z.infer<typeof shieldReviewAdminStatsSchema>

export const shieldReviewAdminActionSchema = z.enum([
  'rerun_review_summary',
  'purge_expired_full_scans',
])
export type ShieldReviewAdminAction = z.infer<
  typeof shieldReviewAdminActionSchema
>

export const shieldReviewAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  classifierId: nonEmptyStringSchema,
  cases: z.array(shieldReviewAdminCaseSchema),
  stats: shieldReviewAdminStatsSchema,
  availableActions: z.array(shieldReviewAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ShieldReviewAdminSummaryResponse = z.infer<
  typeof shieldReviewAdminSummaryResponseSchema
>

export const shieldReviewAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: shieldReviewAdminActionSchema,
})
export type ShieldReviewAdminActionRequest = z.infer<
  typeof shieldReviewAdminActionRequestSchema
>

export const shieldReviewAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: shieldReviewAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: shieldReviewAdminStatsSchema.optional(),
  purgedCount: z.number().int().nonnegative().optional(),
})
export type ShieldReviewAdminActionResponse = z.infer<
  typeof shieldReviewAdminActionResponseSchema
>
