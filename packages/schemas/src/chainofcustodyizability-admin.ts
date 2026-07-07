import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const chainofcustodyizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ChainofcustodyizabilityAdminDomain = z.infer<typeof chainofcustodyizabilityAdminDomainSchema>

export const chainofcustodyizabilityAdminRecordSchema = z.object({
  domain: chainofcustodyizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ChainofcustodyizabilityAdminRecord = z.infer<typeof chainofcustodyizabilityAdminRecordSchema>

export const chainofcustodyizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  chainofcustodyizabilityPercent: z.number().min(0).max(100),
})
export type ChainofcustodyizabilityAdminStats = z.infer<typeof chainofcustodyizabilityAdminStatsSchema>

export const chainofcustodyizabilityAdminActionSchema = z.enum(['refresh_chainofcustodyizability_summary'])
export type ChainofcustodyizabilityAdminAction = z.infer<typeof chainofcustodyizabilityAdminActionSchema>

export const chainofcustodyizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(chainofcustodyizabilityAdminRecordSchema),
  stats: chainofcustodyizabilityAdminStatsSchema,
  availableActions: z.array(chainofcustodyizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ChainofcustodyizabilityAdminSummaryResponse = z.infer<
  typeof chainofcustodyizabilityAdminSummaryResponseSchema
>

export const chainofcustodyizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: chainofcustodyizabilityAdminActionSchema,
})
export type ChainofcustodyizabilityAdminActionRequest = z.infer<
  typeof chainofcustodyizabilityAdminActionRequestSchema
>

export const chainofcustodyizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: chainofcustodyizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: chainofcustodyizabilityAdminStatsSchema.optional(),
})
export type ChainofcustodyizabilityAdminActionResponse = z.infer<
  typeof chainofcustodyizabilityAdminActionResponseSchema
>
