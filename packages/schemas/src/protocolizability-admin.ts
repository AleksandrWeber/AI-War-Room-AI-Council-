import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const protocolizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type ProtocolizabilityAdminDomain = z.infer<typeof protocolizabilityAdminDomainSchema>

export const protocolizabilityAdminRecordSchema = z.object({
  domain: protocolizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProtocolizabilityAdminRecord = z.infer<typeof protocolizabilityAdminRecordSchema>

export const protocolizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  protocolizabilityPercent: z.number().min(0).max(100),
})
export type ProtocolizabilityAdminStats = z.infer<typeof protocolizabilityAdminStatsSchema>

export const protocolizabilityAdminActionSchema = z.enum(['refresh_protocolizability_summary'])
export type ProtocolizabilityAdminAction = z.infer<typeof protocolizabilityAdminActionSchema>

export const protocolizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(protocolizabilityAdminRecordSchema),
  stats: protocolizabilityAdminStatsSchema,
  availableActions: z.array(protocolizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProtocolizabilityAdminSummaryResponse = z.infer<
  typeof protocolizabilityAdminSummaryResponseSchema
>

export const protocolizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: protocolizabilityAdminActionSchema,
})
export type ProtocolizabilityAdminActionRequest = z.infer<
  typeof protocolizabilityAdminActionRequestSchema
>

export const protocolizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: protocolizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: protocolizabilityAdminStatsSchema.optional(),
})
export type ProtocolizabilityAdminActionResponse = z.infer<
  typeof protocolizabilityAdminActionResponseSchema
>
