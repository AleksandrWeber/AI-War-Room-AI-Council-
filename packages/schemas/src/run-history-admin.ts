import { z } from 'zod'
import { artifactTypeSchema, nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const runHistoryAdminRecordSchema = z.object({
  artifactId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  artifactType: artifactTypeSchema,
  artifactVersion: nonEmptyStringSchema,
  createdAt: utcDateStringSchema,
})
export type RunHistoryAdminRecord = z.infer<typeof runHistoryAdminRecordSchema>

export const runHistoryAdminStatsSchema = z.object({
  totalArtifacts: z.number().int().nonnegative(),
  uniqueRunCount: z.number().int().nonnegative(),
  ideaBriefCount: z.number().int().nonnegative(),
  masterPromptCount: z.number().int().nonnegative(),
  uiPromptCount: z.number().int().nonnegative(),
  todoListCount: z.number().int().nonnegative(),
})
export type RunHistoryAdminStats = z.infer<typeof runHistoryAdminStatsSchema>

export const runHistoryAdminActionSchema = z.enum(['refresh_run_history_summary'])
export type RunHistoryAdminAction = z.infer<typeof runHistoryAdminActionSchema>

export const runHistoryExportFormatSchema = z.enum(['csv', 'json'])
export type RunHistoryExportFormat = z.infer<typeof runHistoryExportFormatSchema>

export const runHistoryAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  artifacts: z.array(runHistoryAdminRecordSchema),
  stats: runHistoryAdminStatsSchema,
  availableActions: z.array(runHistoryAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RunHistoryAdminSummaryResponse = z.infer<
  typeof runHistoryAdminSummaryResponseSchema
>

export const runHistoryAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: runHistoryAdminActionSchema,
})
export type RunHistoryAdminActionRequest = z.infer<
  typeof runHistoryAdminActionRequestSchema
>

export const runHistoryAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: runHistoryAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: runHistoryAdminStatsSchema.optional(),
})
export type RunHistoryAdminActionResponse = z.infer<
  typeof runHistoryAdminActionResponseSchema
>

export const runHistoryExportResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  exportedAt: utcDateStringSchema,
  artifacts: z.array(runHistoryAdminRecordSchema),
  stats: runHistoryAdminStatsSchema,
})
export type RunHistoryExportResponse = z.infer<
  typeof runHistoryExportResponseSchema
>
