import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const workspaceSettingsRecordSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  name: nonEmptyStringSchema.max(120),
  createdAt: utcDateStringSchema,
})
export type WorkspaceSettingsRecord = z.infer<typeof workspaceSettingsRecordSchema>

export const workspaceSettingsAdminActionSchema = z.enum([
  'update_workspace_name',
  'reset_workspace_name',
])
export type WorkspaceSettingsAdminAction = z.infer<
  typeof workspaceSettingsAdminActionSchema
>

export const workspaceSettingsAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  settings: workspaceSettingsRecordSchema,
  availableActions: z.array(workspaceSettingsAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WorkspaceSettingsAdminSummaryResponse = z.infer<
  typeof workspaceSettingsAdminSummaryResponseSchema
>

export const workspaceSettingsAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: workspaceSettingsAdminActionSchema,
  name: nonEmptyStringSchema.max(120).optional(),
})
export type WorkspaceSettingsAdminActionRequest = z.infer<
  typeof workspaceSettingsAdminActionRequestSchema
>

export const workspaceSettingsAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: workspaceSettingsAdminActionSchema,
  message: nonEmptyStringSchema,
  settings: workspaceSettingsRecordSchema,
})
export type WorkspaceSettingsAdminActionResponse = z.infer<
  typeof workspaceSettingsAdminActionResponseSchema
>
