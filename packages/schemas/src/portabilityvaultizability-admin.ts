import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const portabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type PortabilityvaultizabilityAdminDomain = z.infer<typeof portabilityvaultizabilityAdminDomainSchema>

export const portabilityvaultizabilityAdminRecordSchema = z.object({
  domain: portabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PortabilityvaultizabilityAdminRecord = z.infer<typeof portabilityvaultizabilityAdminRecordSchema>

export const portabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  portabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type PortabilityvaultizabilityAdminStats = z.infer<typeof portabilityvaultizabilityAdminStatsSchema>

export const portabilityvaultizabilityAdminActionSchema = z.enum(['refresh_portabilityvaultizability_summary'])
export type PortabilityvaultizabilityAdminAction = z.infer<typeof portabilityvaultizabilityAdminActionSchema>

export const portabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(portabilityvaultizabilityAdminRecordSchema),
  stats: portabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(portabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PortabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof portabilityvaultizabilityAdminSummaryResponseSchema
>

export const portabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: portabilityvaultizabilityAdminActionSchema,
})
export type PortabilityvaultizabilityAdminActionRequest = z.infer<
  typeof portabilityvaultizabilityAdminActionRequestSchema
>

export const portabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: portabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: portabilityvaultizabilityAdminStatsSchema.optional(),
})
export type PortabilityvaultizabilityAdminActionResponse = z.infer<
  typeof portabilityvaultizabilityAdminActionResponseSchema
>
