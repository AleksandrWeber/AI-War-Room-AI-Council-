import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const trustworthinessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type TrustworthinessAdminDomain = z.infer<typeof trustworthinessAdminDomainSchema>

export const trustworthinessAdminRecordSchema = z.object({
  domain: trustworthinessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TrustworthinessAdminRecord = z.infer<typeof trustworthinessAdminRecordSchema>

export const trustworthinessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  trustworthinessPercent: z.number().min(0).max(100),
})
export type TrustworthinessAdminStats = z.infer<typeof trustworthinessAdminStatsSchema>

export const trustworthinessAdminActionSchema = z.enum(['refresh_trustworthiness_summary'])
export type TrustworthinessAdminAction = z.infer<typeof trustworthinessAdminActionSchema>

export const trustworthinessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(trustworthinessAdminRecordSchema),
  stats: trustworthinessAdminStatsSchema,
  availableActions: z.array(trustworthinessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TrustworthinessAdminSummaryResponse = z.infer<
  typeof trustworthinessAdminSummaryResponseSchema
>

export const trustworthinessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: trustworthinessAdminActionSchema,
})
export type TrustworthinessAdminActionRequest = z.infer<
  typeof trustworthinessAdminActionRequestSchema
>

export const trustworthinessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: trustworthinessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: trustworthinessAdminStatsSchema.optional(),
})
export type TrustworthinessAdminActionResponse = z.infer<
  typeof trustworthinessAdminActionResponseSchema
>
