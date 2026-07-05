import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const nomenclatizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type NomenclatizabilityAdminDomain = z.infer<typeof nomenclatizabilityAdminDomainSchema>

export const nomenclatizabilityAdminRecordSchema = z.object({
  domain: nomenclatizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NomenclatizabilityAdminRecord = z.infer<typeof nomenclatizabilityAdminRecordSchema>

export const nomenclatizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  nomenclatizabilityPercent: z.number().min(0).max(100),
})
export type NomenclatizabilityAdminStats = z.infer<typeof nomenclatizabilityAdminStatsSchema>

export const nomenclatizabilityAdminActionSchema = z.enum(['refresh_nomenclatizability_summary'])
export type NomenclatizabilityAdminAction = z.infer<typeof nomenclatizabilityAdminActionSchema>

export const nomenclatizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(nomenclatizabilityAdminRecordSchema),
  stats: nomenclatizabilityAdminStatsSchema,
  availableActions: z.array(nomenclatizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NomenclatizabilityAdminSummaryResponse = z.infer<
  typeof nomenclatizabilityAdminSummaryResponseSchema
>

export const nomenclatizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nomenclatizabilityAdminActionSchema,
})
export type NomenclatizabilityAdminActionRequest = z.infer<
  typeof nomenclatizabilityAdminActionRequestSchema
>

export const nomenclatizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: nomenclatizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: nomenclatizabilityAdminStatsSchema.optional(),
})
export type NomenclatizabilityAdminActionResponse = z.infer<
  typeof nomenclatizabilityAdminActionResponseSchema
>
