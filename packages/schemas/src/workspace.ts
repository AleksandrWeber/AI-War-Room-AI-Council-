import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const workspaceRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer'])
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>

export const authUserSchema = z.object({
  userId: nonEmptyStringSchema,
  email: z.email().optional(),
  displayName: nonEmptyStringSchema.max(120).optional(),
  createdAt: utcDateStringSchema,
})
export type AuthUser = z.infer<typeof authUserSchema>

export const workspaceSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  name: nonEmptyStringSchema.max(120),
  createdAt: utcDateStringSchema,
})
export type Workspace = z.infer<typeof workspaceSchema>

export const workspaceMembershipSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  userId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  createdAt: utcDateStringSchema,
})
export type WorkspaceMembership = z.infer<typeof workspaceMembershipSchema>

export const myWorkspaceMembershipSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  name: nonEmptyStringSchema.max(120),
  role: workspaceRoleSchema,
})
export type MyWorkspaceMembership = z.infer<typeof myWorkspaceMembershipSchema>

export const listMyWorkspacesResponseSchema = z.object({
  userId: nonEmptyStringSchema,
  workspaces: z.array(myWorkspaceMembershipSchema).max(200),
})
export type ListMyWorkspacesResponse = z.infer<
  typeof listMyWorkspacesResponseSchema
>

export const createWorkspaceRequestSchema = z.object({
  name: nonEmptyStringSchema.max(120),
})
export type CreateWorkspaceRequest = z.infer<typeof createWorkspaceRequestSchema>

export const createWorkspaceResponseSchema = z.object({
  workspace: myWorkspaceMembershipSchema,
  guidance: nonEmptyStringSchema,
})
export type CreateWorkspaceResponse = z.infer<
  typeof createWorkspaceResponseSchema
>

export const leaveWorkspaceResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  guidance: nonEmptyStringSchema,
})
export type LeaveWorkspaceResponse = z.infer<typeof leaveWorkspaceResponseSchema>

export const archiveWorkspaceResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  guidance: nonEmptyStringSchema,
})
export type ArchiveWorkspaceResponse = z.infer<
  typeof archiveWorkspaceResponseSchema
>

export const authContextSchema = z.object({
  userId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
})
export type AuthContext = z.infer<typeof authContextSchema>
