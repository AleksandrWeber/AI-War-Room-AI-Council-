import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const syntacticizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type SyntacticizabilityAdminDomain = z.infer<typeof syntacticizabilityAdminDomainSchema>

export const syntacticizabilityAdminRecordSchema = z.object({
  domain: syntacticizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SyntacticizabilityAdminRecord = z.infer<typeof syntacticizabilityAdminRecordSchema>

export const syntacticizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  syntacticizabilityPercent: z.number().min(0).max(100),
})
export type SyntacticizabilityAdminStats = z.infer<typeof syntacticizabilityAdminStatsSchema>

export const syntacticizabilityAdminActionSchema = z.enum(['refresh_syntacticizability_summary'])
export type SyntacticizabilityAdminAction = z.infer<typeof syntacticizabilityAdminActionSchema>

export const syntacticizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(syntacticizabilityAdminRecordSchema),
  stats: syntacticizabilityAdminStatsSchema,
  availableActions: z.array(syntacticizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SyntacticizabilityAdminSummaryResponse = z.infer<
  typeof syntacticizabilityAdminSummaryResponseSchema
>

export const syntacticizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: syntacticizabilityAdminActionSchema,
})
export type SyntacticizabilityAdminActionRequest = z.infer<
  typeof syntacticizabilityAdminActionRequestSchema
>

export const syntacticizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: syntacticizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: syntacticizabilityAdminStatsSchema.optional(),
})
export type SyntacticizabilityAdminActionResponse = z.infer<
  typeof syntacticizabilityAdminActionResponseSchema
>
