import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const sandboxizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type SandboxizabilityAdminDomain = z.infer<typeof sandboxizabilityAdminDomainSchema>

export const sandboxizabilityAdminRecordSchema = z.object({
  domain: sandboxizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SandboxizabilityAdminRecord = z.infer<typeof sandboxizabilityAdminRecordSchema>

export const sandboxizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  sandboxizabilityPercent: z.number().min(0).max(100),
})
export type SandboxizabilityAdminStats = z.infer<typeof sandboxizabilityAdminStatsSchema>

export const sandboxizabilityAdminActionSchema = z.enum(['refresh_sandboxizability_summary'])
export type SandboxizabilityAdminAction = z.infer<typeof sandboxizabilityAdminActionSchema>

export const sandboxizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(sandboxizabilityAdminRecordSchema),
  stats: sandboxizabilityAdminStatsSchema,
  availableActions: z.array(sandboxizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SandboxizabilityAdminSummaryResponse = z.infer<
  typeof sandboxizabilityAdminSummaryResponseSchema
>

export const sandboxizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sandboxizabilityAdminActionSchema,
})
export type SandboxizabilityAdminActionRequest = z.infer<
  typeof sandboxizabilityAdminActionRequestSchema
>

export const sandboxizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sandboxizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: sandboxizabilityAdminStatsSchema.optional(),
})
export type SandboxizabilityAdminActionResponse = z.infer<
  typeof sandboxizabilityAdminActionResponseSchema
>
