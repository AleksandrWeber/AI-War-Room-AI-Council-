import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const rollbackabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type RollbackabilizabilityAdminDomain = z.infer<typeof rollbackabilizabilityAdminDomainSchema>

export const rollbackabilizabilityAdminRecordSchema = z.object({
  domain: rollbackabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RollbackabilizabilityAdminRecord = z.infer<typeof rollbackabilizabilityAdminRecordSchema>

export const rollbackabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  rollbackabilizabilityPercent: z.number().min(0).max(100),
})
export type RollbackabilizabilityAdminStats = z.infer<typeof rollbackabilizabilityAdminStatsSchema>

export const rollbackabilizabilityAdminActionSchema = z.enum(['refresh_rollbackabilizability_summary'])
export type RollbackabilizabilityAdminAction = z.infer<typeof rollbackabilizabilityAdminActionSchema>

export const rollbackabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(rollbackabilizabilityAdminRecordSchema),
  stats: rollbackabilizabilityAdminStatsSchema,
  availableActions: z.array(rollbackabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RollbackabilizabilityAdminSummaryResponse = z.infer<
  typeof rollbackabilizabilityAdminSummaryResponseSchema
>

export const rollbackabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: rollbackabilizabilityAdminActionSchema,
})
export type RollbackabilizabilityAdminActionRequest = z.infer<
  typeof rollbackabilizabilityAdminActionRequestSchema
>

export const rollbackabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: rollbackabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: rollbackabilizabilityAdminStatsSchema.optional(),
})
export type RollbackabilizabilityAdminActionResponse = z.infer<
  typeof rollbackabilizabilityAdminActionResponseSchema
>
