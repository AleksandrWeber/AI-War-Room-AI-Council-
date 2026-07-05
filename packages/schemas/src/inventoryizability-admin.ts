import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const inventoryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type InventoryizabilityAdminDomain = z.infer<typeof inventoryizabilityAdminDomainSchema>

export const inventoryizabilityAdminRecordSchema = z.object({
  domain: inventoryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InventoryizabilityAdminRecord = z.infer<typeof inventoryizabilityAdminRecordSchema>

export const inventoryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  inventoryizabilityPercent: z.number().min(0).max(100),
})
export type InventoryizabilityAdminStats = z.infer<typeof inventoryizabilityAdminStatsSchema>

export const inventoryizabilityAdminActionSchema = z.enum(['refresh_inventoryizability_summary'])
export type InventoryizabilityAdminAction = z.infer<typeof inventoryizabilityAdminActionSchema>

export const inventoryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(inventoryizabilityAdminRecordSchema),
  stats: inventoryizabilityAdminStatsSchema,
  availableActions: z.array(inventoryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InventoryizabilityAdminSummaryResponse = z.infer<
  typeof inventoryizabilityAdminSummaryResponseSchema
>

export const inventoryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inventoryizabilityAdminActionSchema,
})
export type InventoryizabilityAdminActionRequest = z.infer<
  typeof inventoryizabilityAdminActionRequestSchema
>

export const inventoryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inventoryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: inventoryizabilityAdminStatsSchema.optional(),
})
export type InventoryizabilityAdminActionResponse = z.infer<
  typeof inventoryizabilityAdminActionResponseSchema
>
