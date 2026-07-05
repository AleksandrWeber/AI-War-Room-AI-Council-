import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const definizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type DefinizabilityAdminDomain = z.infer<typeof definizabilityAdminDomainSchema>

export const definizabilityAdminRecordSchema = z.object({
  domain: definizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DefinizabilityAdminRecord = z.infer<typeof definizabilityAdminRecordSchema>

export const definizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  definizabilityPercent: z.number().min(0).max(100),
})
export type DefinizabilityAdminStats = z.infer<typeof definizabilityAdminStatsSchema>

export const definizabilityAdminActionSchema = z.enum(['refresh_definizability_summary'])
export type DefinizabilityAdminAction = z.infer<typeof definizabilityAdminActionSchema>

export const definizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(definizabilityAdminRecordSchema),
  stats: definizabilityAdminStatsSchema,
  availableActions: z.array(definizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DefinizabilityAdminSummaryResponse = z.infer<
  typeof definizabilityAdminSummaryResponseSchema
>

export const definizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: definizabilityAdminActionSchema,
})
export type DefinizabilityAdminActionRequest = z.infer<
  typeof definizabilityAdminActionRequestSchema
>

export const definizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: definizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: definizabilityAdminStatsSchema.optional(),
})
export type DefinizabilityAdminActionResponse = z.infer<
  typeof definizabilityAdminActionResponseSchema
>
