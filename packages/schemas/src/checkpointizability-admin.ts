import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const checkpointizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CheckpointizabilityAdminDomain = z.infer<typeof checkpointizabilityAdminDomainSchema>

export const checkpointizabilityAdminRecordSchema = z.object({
  domain: checkpointizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CheckpointizabilityAdminRecord = z.infer<typeof checkpointizabilityAdminRecordSchema>

export const checkpointizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  checkpointizabilityPercent: z.number().min(0).max(100),
})
export type CheckpointizabilityAdminStats = z.infer<typeof checkpointizabilityAdminStatsSchema>

export const checkpointizabilityAdminActionSchema = z.enum(['refresh_checkpointizability_summary'])
export type CheckpointizabilityAdminAction = z.infer<typeof checkpointizabilityAdminActionSchema>

export const checkpointizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(checkpointizabilityAdminRecordSchema),
  stats: checkpointizabilityAdminStatsSchema,
  availableActions: z.array(checkpointizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CheckpointizabilityAdminSummaryResponse = z.infer<
  typeof checkpointizabilityAdminSummaryResponseSchema
>

export const checkpointizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: checkpointizabilityAdminActionSchema,
})
export type CheckpointizabilityAdminActionRequest = z.infer<
  typeof checkpointizabilityAdminActionRequestSchema
>

export const checkpointizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: checkpointizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: checkpointizabilityAdminStatsSchema.optional(),
})
export type CheckpointizabilityAdminActionResponse = z.infer<
  typeof checkpointizabilityAdminActionResponseSchema
>
