import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const measurabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type MeasurabilityvaultizabilityAdminDomain = z.infer<typeof measurabilityvaultizabilityAdminDomainSchema>

export const measurabilityvaultizabilityAdminRecordSchema = z.object({
  domain: measurabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MeasurabilityvaultizabilityAdminRecord = z.infer<typeof measurabilityvaultizabilityAdminRecordSchema>

export const measurabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  measurabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type MeasurabilityvaultizabilityAdminStats = z.infer<typeof measurabilityvaultizabilityAdminStatsSchema>

export const measurabilityvaultizabilityAdminActionSchema = z.enum(['refresh_measurabilityvaultizability_summary'])
export type MeasurabilityvaultizabilityAdminAction = z.infer<typeof measurabilityvaultizabilityAdminActionSchema>

export const measurabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(measurabilityvaultizabilityAdminRecordSchema),
  stats: measurabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(measurabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MeasurabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof measurabilityvaultizabilityAdminSummaryResponseSchema
>

export const measurabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: measurabilityvaultizabilityAdminActionSchema,
})
export type MeasurabilityvaultizabilityAdminActionRequest = z.infer<
  typeof measurabilityvaultizabilityAdminActionRequestSchema
>

export const measurabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: measurabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: measurabilityvaultizabilityAdminStatsSchema.optional(),
})
export type MeasurabilityvaultizabilityAdminActionResponse = z.infer<
  typeof measurabilityvaultizabilityAdminActionResponseSchema
>
