import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const containerizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ContainerizabilityAdminDomain = z.infer<typeof containerizabilityAdminDomainSchema>

export const containerizabilityAdminRecordSchema = z.object({
  domain: containerizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ContainerizabilityAdminRecord = z.infer<typeof containerizabilityAdminRecordSchema>

export const containerizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  containerizabilityPercent: z.number().min(0).max(100),
})
export type ContainerizabilityAdminStats = z.infer<typeof containerizabilityAdminStatsSchema>

export const containerizabilityAdminActionSchema = z.enum(['refresh_containerizability_summary'])
export type ContainerizabilityAdminAction = z.infer<typeof containerizabilityAdminActionSchema>

export const containerizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(containerizabilityAdminRecordSchema),
  stats: containerizabilityAdminStatsSchema,
  availableActions: z.array(containerizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ContainerizabilityAdminSummaryResponse = z.infer<
  typeof containerizabilityAdminSummaryResponseSchema
>

export const containerizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: containerizabilityAdminActionSchema,
})
export type ContainerizabilityAdminActionRequest = z.infer<
  typeof containerizabilityAdminActionRequestSchema
>

export const containerizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: containerizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: containerizabilityAdminStatsSchema.optional(),
})
export type ContainerizabilityAdminActionResponse = z.infer<
  typeof containerizabilityAdminActionResponseSchema
>
