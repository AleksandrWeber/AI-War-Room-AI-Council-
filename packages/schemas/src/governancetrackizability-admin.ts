import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const governancetrackizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type GovernancetrackizabilityAdminDomain = z.infer<typeof governancetrackizabilityAdminDomainSchema>

export const governancetrackizabilityAdminRecordSchema = z.object({
  domain: governancetrackizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GovernancetrackizabilityAdminRecord = z.infer<typeof governancetrackizabilityAdminRecordSchema>

export const governancetrackizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  governancetrackizabilityPercent: z.number().min(0).max(100),
})
export type GovernancetrackizabilityAdminStats = z.infer<typeof governancetrackizabilityAdminStatsSchema>

export const governancetrackizabilityAdminActionSchema = z.enum(['refresh_governancetrackizability_summary'])
export type GovernancetrackizabilityAdminAction = z.infer<typeof governancetrackizabilityAdminActionSchema>

export const governancetrackizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(governancetrackizabilityAdminRecordSchema),
  stats: governancetrackizabilityAdminStatsSchema,
  availableActions: z.array(governancetrackizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GovernancetrackizabilityAdminSummaryResponse = z.infer<
  typeof governancetrackizabilityAdminSummaryResponseSchema
>

export const governancetrackizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: governancetrackizabilityAdminActionSchema,
})
export type GovernancetrackizabilityAdminActionRequest = z.infer<
  typeof governancetrackizabilityAdminActionRequestSchema
>

export const governancetrackizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: governancetrackizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: governancetrackizabilityAdminStatsSchema.optional(),
})
export type GovernancetrackizabilityAdminActionResponse = z.infer<
  typeof governancetrackizabilityAdminActionResponseSchema
>
