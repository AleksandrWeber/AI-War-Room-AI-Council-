import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const signatureproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type SignatureproofizabilityAdminDomain = z.infer<typeof signatureproofizabilityAdminDomainSchema>

export const signatureproofizabilityAdminRecordSchema = z.object({
  domain: signatureproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SignatureproofizabilityAdminRecord = z.infer<typeof signatureproofizabilityAdminRecordSchema>

export const signatureproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  signatureproofizabilityPercent: z.number().min(0).max(100),
})
export type SignatureproofizabilityAdminStats = z.infer<typeof signatureproofizabilityAdminStatsSchema>

export const signatureproofizabilityAdminActionSchema = z.enum(['refresh_signatureproofizability_summary'])
export type SignatureproofizabilityAdminAction = z.infer<typeof signatureproofizabilityAdminActionSchema>

export const signatureproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(signatureproofizabilityAdminRecordSchema),
  stats: signatureproofizabilityAdminStatsSchema,
  availableActions: z.array(signatureproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SignatureproofizabilityAdminSummaryResponse = z.infer<
  typeof signatureproofizabilityAdminSummaryResponseSchema
>

export const signatureproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: signatureproofizabilityAdminActionSchema,
})
export type SignatureproofizabilityAdminActionRequest = z.infer<
  typeof signatureproofizabilityAdminActionRequestSchema
>

export const signatureproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: signatureproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: signatureproofizabilityAdminStatsSchema.optional(),
})
export type SignatureproofizabilityAdminActionResponse = z.infer<
  typeof signatureproofizabilityAdminActionResponseSchema
>
