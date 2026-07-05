import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const oversightAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_webhook_events',
])
export type OversightAdminDomain = z.infer<typeof oversightAdminDomainSchema>

export const oversightAdminRecordSchema = z.object({
  domain: oversightAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type OversightAdminRecord = z.infer<typeof oversightAdminRecordSchema>

export const oversightAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  oversightPercent: z.number().min(0).max(100),
})
export type OversightAdminStats = z.infer<typeof oversightAdminStatsSchema>

export const oversightAdminActionSchema = z.enum([
  'refresh_oversight_summary',
])
export type OversightAdminAction = z.infer<typeof oversightAdminActionSchema>

export const oversightAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(oversightAdminRecordSchema),
  stats: oversightAdminStatsSchema,
  availableActions: z.array(oversightAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type OversightAdminSummaryResponse = z.infer<
  typeof oversightAdminSummaryResponseSchema
>

export const oversightAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: oversightAdminActionSchema,
})
export type OversightAdminActionRequest = z.infer<
  typeof oversightAdminActionRequestSchema
>

export const oversightAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: oversightAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: oversightAdminStatsSchema.optional(),
})
export type OversightAdminActionResponse = z.infer<
  typeof oversightAdminActionResponseSchema
>
