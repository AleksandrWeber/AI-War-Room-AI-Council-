import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const integrityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'shield_scans',
])
export type IntegrityAdminDomain = z.infer<typeof integrityAdminDomainSchema>

export const integrityAdminRecordSchema = z.object({
  domain: integrityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IntegrityAdminRecord = z.infer<typeof integrityAdminRecordSchema>

export const integrityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  integrityPercent: z.number().min(0).max(100),
})
export type IntegrityAdminStats = z.infer<typeof integrityAdminStatsSchema>

export const integrityAdminActionSchema = z.enum(['refresh_integrity_summary'])
export type IntegrityAdminAction = z.infer<typeof integrityAdminActionSchema>

export const integrityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(integrityAdminRecordSchema),
  stats: integrityAdminStatsSchema,
  availableActions: z.array(integrityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IntegrityAdminSummaryResponse = z.infer<
  typeof integrityAdminSummaryResponseSchema
>

export const integrityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrityAdminActionSchema,
})
export type IntegrityAdminActionRequest = z.infer<
  typeof integrityAdminActionRequestSchema
>

export const integrityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: integrityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: integrityAdminStatsSchema.optional(),
})
export type IntegrityAdminActionResponse = z.infer<
  typeof integrityAdminActionResponseSchema
>
