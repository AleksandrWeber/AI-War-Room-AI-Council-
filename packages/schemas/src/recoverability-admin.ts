import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const recoverabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'blocked_runs',
  'run_workflows',
])
export type RecoverabilityAdminDomain = z.infer<
  typeof recoverabilityAdminDomainSchema
>

export const recoverabilityAdminRecordSchema = z.object({
  domain: recoverabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RecoverabilityAdminRecord = z.infer<
  typeof recoverabilityAdminRecordSchema
>

export const recoverabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  recoverabilityPercent: z.number().min(0).max(100),
})
export type RecoverabilityAdminStats = z.infer<
  typeof recoverabilityAdminStatsSchema
>

export const recoverabilityAdminActionSchema = z.enum([
  'refresh_recoverability_summary',
])
export type RecoverabilityAdminAction = z.infer<
  typeof recoverabilityAdminActionSchema
>

export const recoverabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(recoverabilityAdminRecordSchema),
  stats: recoverabilityAdminStatsSchema,
  availableActions: z.array(recoverabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RecoverabilityAdminSummaryResponse = z.infer<
  typeof recoverabilityAdminSummaryResponseSchema
>

export const recoverabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recoverabilityAdminActionSchema,
})
export type RecoverabilityAdminActionRequest = z.infer<
  typeof recoverabilityAdminActionRequestSchema
>

export const recoverabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recoverabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: recoverabilityAdminStatsSchema.optional(),
})
export type RecoverabilityAdminActionResponse = z.infer<
  typeof recoverabilityAdminActionResponseSchema
>
