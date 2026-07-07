import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const inspectabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type InspectabilityvaultizabilityAdminDomain = z.infer<typeof inspectabilityvaultizabilityAdminDomainSchema>

export const inspectabilityvaultizabilityAdminRecordSchema = z.object({
  domain: inspectabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InspectabilityvaultizabilityAdminRecord = z.infer<typeof inspectabilityvaultizabilityAdminRecordSchema>

export const inspectabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  inspectabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type InspectabilityvaultizabilityAdminStats = z.infer<typeof inspectabilityvaultizabilityAdminStatsSchema>

export const inspectabilityvaultizabilityAdminActionSchema = z.enum(['refresh_inspectabilityvaultizability_summary'])
export type InspectabilityvaultizabilityAdminAction = z.infer<typeof inspectabilityvaultizabilityAdminActionSchema>

export const inspectabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(inspectabilityvaultizabilityAdminRecordSchema),
  stats: inspectabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(inspectabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InspectabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof inspectabilityvaultizabilityAdminSummaryResponseSchema
>

export const inspectabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inspectabilityvaultizabilityAdminActionSchema,
})
export type InspectabilityvaultizabilityAdminActionRequest = z.infer<
  typeof inspectabilityvaultizabilityAdminActionRequestSchema
>

export const inspectabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inspectabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: inspectabilityvaultizabilityAdminStatsSchema.optional(),
})
export type InspectabilityvaultizabilityAdminActionResponse = z.infer<
  typeof inspectabilityvaultizabilityAdminActionResponseSchema
>
