import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const recognizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'run_workflows',
])
export type RecognizabilityAdminDomain = z.infer<typeof recognizabilityAdminDomainSchema>

export const recognizabilityAdminRecordSchema = z.object({
  domain: recognizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RecognizabilityAdminRecord = z.infer<typeof recognizabilityAdminRecordSchema>

export const recognizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  recognizabilityPercent: z.number().min(0).max(100),
})
export type RecognizabilityAdminStats = z.infer<typeof recognizabilityAdminStatsSchema>

export const recognizabilityAdminActionSchema = z.enum(['refresh_recognizability_summary'])
export type RecognizabilityAdminAction = z.infer<typeof recognizabilityAdminActionSchema>

export const recognizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(recognizabilityAdminRecordSchema),
  stats: recognizabilityAdminStatsSchema,
  availableActions: z.array(recognizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RecognizabilityAdminSummaryResponse = z.infer<
  typeof recognizabilityAdminSummaryResponseSchema
>

export const recognizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recognizabilityAdminActionSchema,
})
export type RecognizabilityAdminActionRequest = z.infer<
  typeof recognizabilityAdminActionRequestSchema
>

export const recognizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: recognizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: recognizabilityAdminStatsSchema.optional(),
})
export type RecognizabilityAdminActionResponse = z.infer<
  typeof recognizabilityAdminActionResponseSchema
>
