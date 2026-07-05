import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const conspicuousnessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type ConspicuousnessAdminDomain = z.infer<typeof conspicuousnessAdminDomainSchema>

export const conspicuousnessAdminRecordSchema = z.object({
  domain: conspicuousnessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConspicuousnessAdminRecord = z.infer<typeof conspicuousnessAdminRecordSchema>

export const conspicuousnessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  conspicuousnessPercent: z.number().min(0).max(100),
})
export type ConspicuousnessAdminStats = z.infer<typeof conspicuousnessAdminStatsSchema>

export const conspicuousnessAdminActionSchema = z.enum(['refresh_conspicuousness_summary'])
export type ConspicuousnessAdminAction = z.infer<typeof conspicuousnessAdminActionSchema>

export const conspicuousnessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(conspicuousnessAdminRecordSchema),
  stats: conspicuousnessAdminStatsSchema,
  availableActions: z.array(conspicuousnessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConspicuousnessAdminSummaryResponse = z.infer<
  typeof conspicuousnessAdminSummaryResponseSchema
>

export const conspicuousnessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: conspicuousnessAdminActionSchema,
})
export type ConspicuousnessAdminActionRequest = z.infer<
  typeof conspicuousnessAdminActionRequestSchema
>

export const conspicuousnessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: conspicuousnessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: conspicuousnessAdminStatsSchema.optional(),
})
export type ConspicuousnessAdminActionResponse = z.infer<
  typeof conspicuousnessAdminActionResponseSchema
>
