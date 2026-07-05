import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const memorizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type MemorizabilityAdminDomain = z.infer<typeof memorizabilityAdminDomainSchema>

export const memorizabilityAdminRecordSchema = z.object({
  domain: memorizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MemorizabilityAdminRecord = z.infer<typeof memorizabilityAdminRecordSchema>

export const memorizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  memorizabilityPercent: z.number().min(0).max(100),
})
export type MemorizabilityAdminStats = z.infer<typeof memorizabilityAdminStatsSchema>

export const memorizabilityAdminActionSchema = z.enum(['refresh_memorizability_summary'])
export type MemorizabilityAdminAction = z.infer<typeof memorizabilityAdminActionSchema>

export const memorizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(memorizabilityAdminRecordSchema),
  stats: memorizabilityAdminStatsSchema,
  availableActions: z.array(memorizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MemorizabilityAdminSummaryResponse = z.infer<
  typeof memorizabilityAdminSummaryResponseSchema
>

export const memorizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: memorizabilityAdminActionSchema,
})
export type MemorizabilityAdminActionRequest = z.infer<
  typeof memorizabilityAdminActionRequestSchema
>

export const memorizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: memorizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: memorizabilityAdminStatsSchema.optional(),
})
export type MemorizabilityAdminActionResponse = z.infer<
  typeof memorizabilityAdminActionResponseSchema
>
