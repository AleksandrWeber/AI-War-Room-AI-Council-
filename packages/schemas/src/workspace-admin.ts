import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const workspaceMemberAdminRecordSchema = z.object({
  userId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  email: z.string().nullable(),
  displayName: z.string().nullable(),
})
export type WorkspaceMemberAdminRecord = z.infer<
  typeof workspaceMemberAdminRecordSchema
>

export const workspaceMemberAdminStatsSchema = z.object({
  memberCount: z.number().int().nonnegative(),
  ownerCount: z.number().int().nonnegative(),
  adminCount: z.number().int().nonnegative(),
})
export type WorkspaceMemberAdminStats = z.infer<
  typeof workspaceMemberAdminStatsSchema
>

export const workspaceMemberAdminActionSchema = z.enum([
  'update_member_role',
  'remove_member',
  'add_member',
])
export type WorkspaceMemberAdminAction = z.infer<
  typeof workspaceMemberAdminActionSchema
>

export const workspaceMemberAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  members: z.array(workspaceMemberAdminRecordSchema),
  stats: workspaceMemberAdminStatsSchema,
  availableActions: z.array(workspaceMemberAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WorkspaceMemberAdminSummaryResponse = z.infer<
  typeof workspaceMemberAdminSummaryResponseSchema
>

export const workspaceMemberAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: workspaceMemberAdminActionSchema,
  userId: nonEmptyStringSchema,
  role: workspaceRoleSchema.optional(),
  email: z.string().optional(),
  displayName: z.string().optional(),
})
export type WorkspaceMemberAdminActionRequest = z.infer<
  typeof workspaceMemberAdminActionRequestSchema
>

export const workspaceMemberAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: workspaceMemberAdminActionSchema,
  message: nonEmptyStringSchema,
  member: workspaceMemberAdminRecordSchema.optional(),
})
export type WorkspaceMemberAdminActionResponse = z.infer<
  typeof workspaceMemberAdminActionResponseSchema
>

export const workspaceAdminCapabilitiesResponseSchema = z.object({
  supportsWorkspaceMemberAdminTools: z.literal(true),
  supportsWorkspaceAuditExport: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WorkspaceAdminCapabilitiesResponse = z.infer<
  typeof workspaceAdminCapabilitiesResponseSchema
>
