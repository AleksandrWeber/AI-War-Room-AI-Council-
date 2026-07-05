import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const probabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type ProbabilizabilityAdminDomain = z.infer<typeof probabilizabilityAdminDomainSchema>

export const probabilizabilityAdminRecordSchema = z.object({
  domain: probabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProbabilizabilityAdminRecord = z.infer<typeof probabilizabilityAdminRecordSchema>

export const probabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  probabilizabilityPercent: z.number().min(0).max(100),
})
export type ProbabilizabilityAdminStats = z.infer<typeof probabilizabilityAdminStatsSchema>

export const probabilizabilityAdminActionSchema = z.enum(['refresh_probabilizability_summary'])
export type ProbabilizabilityAdminAction = z.infer<typeof probabilizabilityAdminActionSchema>

export const probabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(probabilizabilityAdminRecordSchema),
  stats: probabilizabilityAdminStatsSchema,
  availableActions: z.array(probabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProbabilizabilityAdminSummaryResponse = z.infer<
  typeof probabilizabilityAdminSummaryResponseSchema
>

export const probabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: probabilizabilityAdminActionSchema,
})
export type ProbabilizabilityAdminActionRequest = z.infer<
  typeof probabilizabilityAdminActionRequestSchema
>

export const probabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: probabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: probabilizabilityAdminStatsSchema.optional(),
})
export type ProbabilizabilityAdminActionResponse = z.infer<
  typeof probabilizabilityAdminActionResponseSchema
>
