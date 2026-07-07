import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const governanceizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type GovernanceizabilityAdminDomain = z.infer<typeof governanceizabilityAdminDomainSchema>

export const governanceizabilityAdminRecordSchema = z.object({
  domain: governanceizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GovernanceizabilityAdminRecord = z.infer<typeof governanceizabilityAdminRecordSchema>

export const governanceizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  governanceizabilityPercent: z.number().min(0).max(100),
})
export type GovernanceizabilityAdminStats = z.infer<typeof governanceizabilityAdminStatsSchema>

export const governanceizabilityAdminActionSchema = z.enum(['refresh_governanceizability_summary'])
export type GovernanceizabilityAdminAction = z.infer<typeof governanceizabilityAdminActionSchema>

export const governanceizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(governanceizabilityAdminRecordSchema),
  stats: governanceizabilityAdminStatsSchema,
  availableActions: z.array(governanceizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GovernanceizabilityAdminSummaryResponse = z.infer<
  typeof governanceizabilityAdminSummaryResponseSchema
>

export const governanceizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: governanceizabilityAdminActionSchema,
})
export type GovernanceizabilityAdminActionRequest = z.infer<
  typeof governanceizabilityAdminActionRequestSchema
>

export const governanceizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: governanceizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: governanceizabilityAdminStatsSchema.optional(),
})
export type GovernanceizabilityAdminActionResponse = z.infer<
  typeof governanceizabilityAdminActionResponseSchema
>
