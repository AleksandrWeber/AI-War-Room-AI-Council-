import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const workspaceInviteRoleSchema = workspaceRoleSchema.exclude(['owner'])
export type WorkspaceInviteRole = z.infer<typeof workspaceInviteRoleSchema>

export const workspaceInviteStatusSchema = z.enum([
  'pending',
  'accepted',
  'revoked',
  'expired',
])
export type WorkspaceInviteStatus = z.infer<typeof workspaceInviteStatusSchema>

export const createWorkspaceInviteRequestSchema = z.object({
  email: z.email().max(320),
  role: workspaceInviteRoleSchema.default('member'),
  expiresInHours: z.number().int().positive().max(720).default(168),
})

export const workspaceInviteRecordSchema = z.object({
  inviteId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  email: z.email(),
  role: workspaceInviteRoleSchema,
  status: workspaceInviteStatusSchema,
  invitedByUserId: nonEmptyStringSchema,
  expiresAt: utcDateStringSchema,
  acceptedAt: utcDateStringSchema.optional(),
  acceptedByUserId: nonEmptyStringSchema.optional(),
  revokedAt: utcDateStringSchema.optional(),
  createdAt: utcDateStringSchema,
})

export const createWorkspaceInviteResponseSchema = z.object({
  invite: workspaceInviteRecordSchema,
  token: nonEmptyStringSchema,
  inviteUrl: nonEmptyStringSchema,
  delivery: z.literal('link_only'),
  guidance: nonEmptyStringSchema,
})

export const listWorkspaceInvitesResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  invites: z.array(workspaceInviteRecordSchema).max(200),
})

export const acceptWorkspaceInviteRequestSchema = z.object({
  token: nonEmptyStringSchema.min(16).max(200),
})

export const acceptWorkspaceInviteResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceInviteRoleSchema,
  memberUserId: nonEmptyStringSchema,
  inviteId: nonEmptyStringSchema,
  guidance: nonEmptyStringSchema,
})

export const revokeWorkspaceInviteResponseSchema = z.object({
  invite: workspaceInviteRecordSchema,
  guidance: nonEmptyStringSchema,
})

export type CreateWorkspaceInviteRequest = z.infer<
  typeof createWorkspaceInviteRequestSchema
>
export type WorkspaceInviteRecord = z.infer<typeof workspaceInviteRecordSchema>
export type CreateWorkspaceInviteResponse = z.infer<
  typeof createWorkspaceInviteResponseSchema
>
export type ListWorkspaceInvitesResponse = z.infer<
  typeof listWorkspaceInvitesResponseSchema
>
export type AcceptWorkspaceInviteRequest = z.infer<
  typeof acceptWorkspaceInviteRequestSchema
>
export type AcceptWorkspaceInviteResponse = z.infer<
  typeof acceptWorkspaceInviteResponseSchema
>
export type RevokeWorkspaceInviteResponse = z.infer<
  typeof revokeWorkspaceInviteResponseSchema
>
