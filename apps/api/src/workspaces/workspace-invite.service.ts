import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import {
  acceptWorkspaceInviteRequestSchema,
  acceptWorkspaceInviteResponseSchema,
  createWorkspaceInviteRequestSchema,
  createWorkspaceInviteResponseSchema,
  listWorkspaceInvitesResponseSchema,
  resendWorkspaceInviteResponseSchema,
  revokeWorkspaceInviteResponseSchema,
  type AuthContext,
  type WorkspaceInviteRecord,
  type WorkspaceInviteRole,
  type WorkspaceInviteStatus,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { PostgresService } from '../persistence/postgres.service.js'
import {
  INVITE_EMAIL_ADAPTER,
  type InviteEmailAdapter,
} from './invite-email.adapter.js'
import {
  WORKSPACE_REPOSITORY,
  type WorkspaceRepository,
} from './workspace.repository.js'

type InviteRow = {
  inviteId: string
  workspaceId: string
  email: string
  role: WorkspaceInviteRole
  tokenHash: string
  invitedByUserId: string
  expiresAt: string
  acceptedAt?: string
  acceptedByUserId?: string
  revokedAt?: string
  createdAt: string
}

@Injectable()
export class WorkspaceInviteService {
  private readonly logger = new Logger(WorkspaceInviteService.name)
  private readonly memoryInvites = new Map<string, InviteRow>()

  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly postgresService: PostgresService,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(INVITE_EMAIL_ADAPTER)
    private readonly inviteEmailAdapter: InviteEmailAdapter,
  ) {}

  async createInvite(input: {
    authContext: AuthContext
    workspaceId: string
    body: unknown
  }) {
    this.assertCanManageInvites(input.authContext, input.workspaceId)

    const parsed = createWorkspaceInviteRequestSchema.safeParse(input.body)
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid create workspace invite request.',
        issues: parsed.error.issues,
      })
    }

    const token = randomBytes(24).toString('base64url')
    const now = new Date()
    const expiresAt = new Date(
      now.getTime() + parsed.data.expiresInHours * 60 * 60 * 1000,
    ).toISOString()
    const invite: InviteRow = {
      inviteId: `invite_${randomUUID()}`,
      workspaceId: input.workspaceId,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      tokenHash: this.hashToken(token),
      invitedByUserId: input.authContext.userId,
      expiresAt,
      createdAt: now.toISOString(),
    }

    await this.persistInvite(invite)

    const inviteUrl = `${this.configService.get('WEB_ORIGIN', { infer: true })}/?inviteToken=${encodeURIComponent(token)}`
    const deliveryResult = await this.inviteEmailAdapter.send({
      to: invite.email,
      inviteUrl,
      workspaceId: invite.workspaceId,
      role: invite.role,
      expiresAt: invite.expiresAt,
    })
    this.logger.log(
      `Workspace invite created for ${invite.email} in ${invite.workspaceId} (${deliveryResult.delivery} delivery; ref=${deliveryResult.deliveryReference}).`,
    )

    return createWorkspaceInviteResponseSchema.parse({
      invite: this.toPublicRecord(invite),
      token,
      inviteUrl,
      delivery: deliveryResult.delivery,
      guidance: this.deliveryGuidance(deliveryResult.delivery, 'created'),
    })
  }

  async listInvites(input: { authContext: AuthContext; workspaceId: string }) {
    this.assertCanManageInvites(input.authContext, input.workspaceId)
    const invites = await this.loadInvites(input.workspaceId)

    return listWorkspaceInvitesResponseSchema.parse({
      workspaceId: input.workspaceId,
      invites: invites.map((invite) => this.toPublicRecord(invite)),
    })
  }

  async revokeInvite(input: {
    authContext: AuthContext
    workspaceId: string
    inviteId: string
  }) {
    this.assertCanManageInvites(input.authContext, input.workspaceId)
    const invite = await this.findById(input.inviteId)

    if (!invite || invite.workspaceId !== input.workspaceId) {
      throw new NotFoundException({ message: 'Invite was not found.' })
    }

    const status = this.resolveStatus(invite)
    if (status !== 'pending') {
      throw new BadRequestException({
        message: `Invite is ${status} and cannot be revoked.`,
      })
    }

    const revokedAt = new Date().toISOString()
    await this.markRevoked({ inviteId: invite.inviteId, revokedAt })

    return revokeWorkspaceInviteResponseSchema.parse({
      invite: this.toPublicRecord({ ...invite, revokedAt }),
      guidance: 'Invite revoked. The join link can no longer be accepted.',
    })
  }

  async resendInvite(input: {
    authContext: AuthContext
    workspaceId: string
    inviteId: string
    body: unknown
  }) {
    this.assertCanManageInvites(input.authContext, input.workspaceId)
    const invite = await this.findById(input.inviteId)

    if (!invite || invite.workspaceId !== input.workspaceId) {
      throw new NotFoundException({ message: 'Invite was not found.' })
    }

    const status = this.resolveStatus(invite)
    if (status !== 'pending' && status !== 'expired') {
      throw new BadRequestException({
        message: `Invite is ${status} and cannot be resent.`,
      })
    }

    const parsedBody = createWorkspaceInviteRequestSchema
      .pick({ expiresInHours: true })
      .safeParse(input.body ?? {})
    if (!parsedBody.success) {
      throw new BadRequestException({
        message: 'Invalid resend workspace invite request.',
        issues: parsedBody.error.issues,
      })
    }

    const token = randomBytes(24).toString('base64url')
    const now = new Date()
    const expiresAt = new Date(
      now.getTime() + parsedBody.data.expiresInHours * 60 * 60 * 1000,
    ).toISOString()
    const rotated: InviteRow = {
      ...invite,
      tokenHash: this.hashToken(token),
      expiresAt,
      acceptedAt: undefined,
      acceptedByUserId: undefined,
      revokedAt: undefined,
    }

    await this.persistInviteRotation(rotated)

    const inviteUrl = `${this.configService.get('WEB_ORIGIN', { infer: true })}/?inviteToken=${encodeURIComponent(token)}`
    const deliveryResult = await this.inviteEmailAdapter.send({
      to: rotated.email,
      inviteUrl,
      workspaceId: rotated.workspaceId,
      role: rotated.role,
      expiresAt: rotated.expiresAt,
    })
    this.logger.log(
      `Workspace invite resent for ${rotated.email} in ${rotated.workspaceId} (${deliveryResult.delivery} delivery; ref=${deliveryResult.deliveryReference}).`,
    )

    return resendWorkspaceInviteResponseSchema.parse({
      invite: this.toPublicRecord(rotated),
      token,
      inviteUrl,
      delivery: deliveryResult.delivery,
      guidance: this.deliveryGuidance(deliveryResult.delivery, 'resent'),
    })
  }

  async acceptInvite(input: { authContext: AuthContext; body: unknown }) {
    const parsed = acceptWorkspaceInviteRequestSchema.safeParse(input.body)
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid accept workspace invite request.',
        issues: parsed.error.issues,
      })
    }

    const invite = await this.findByTokenHash(this.hashToken(parsed.data.token))
    if (!invite) {
      throw new NotFoundException({ message: 'Invite token was not found.' })
    }

    const status = this.resolveStatus(invite)
    if (status !== 'pending') {
      throw new BadRequestException({
        message: `Invite is ${status} and cannot be accepted.`,
      })
    }

    const profile = await this.workspaceRepository.findUserProfile(
      input.authContext.userId,
    )
    const actorEmail = profile?.email?.trim().toLowerCase()

    if (!profile || !actorEmail) {
      throw new BadRequestException({
        message:
          'Your account has no email on file. Sign in with an email identity before accepting an invite.',
      })
    }

    if (actorEmail !== invite.email) {
      throw new ForbiddenException({
        message: `This invite was issued for ${invite.email}. Sign in as that email to accept.`,
      })
    }

    const existingMembership = await this.workspaceRepository.findMembership(
      input.authContext.userId,
      invite.workspaceId,
    )

    const member = existingMembership
      ? {
          workspaceId: existingMembership.workspaceId,
          userId: existingMembership.userId,
          role: existingMembership.role,
          email: invite.email,
          displayName: profile.displayName,
        }
      : await this.workspaceRepository.addWorkspaceMember({
          workspaceId: invite.workspaceId,
          userId: input.authContext.userId,
          role: invite.role,
          email: invite.email,
          displayName: profile.displayName ?? undefined,
        })

    const acceptedAt = new Date().toISOString()
    await this.markAccepted({
      inviteId: invite.inviteId,
      acceptedAt,
      acceptedByUserId: member.userId,
    })

    return acceptWorkspaceInviteResponseSchema.parse({
      workspaceId: invite.workspaceId,
      role: member.role,
      memberUserId: member.userId,
      inviteId: invite.inviteId,
      guidance: existingMembership
        ? 'Invite accepted. You already had access; active membership is unchanged.'
        : 'Invite accepted. Workspace membership is now active for this user.',
    })
  }

  private deliveryGuidance(
    delivery: 'mock' | 'email_stub' | 'link_only',
    mode: 'created' | 'resent',
  ) {
    if (delivery === 'email_stub') {
      return mode === 'created'
        ? 'Invite email was stub-delivered. The join URL is also returned for copy/share.'
        : 'Invite email was stub-resent with a rotated link. The previous token no longer works.'
    }

    if (delivery === 'mock') {
      return mode === 'created'
        ? 'Invite recorded with mock email delivery. Share the invite URL with the recipient.'
        : 'Invite link rotated with mock email delivery. Share the new URL; the previous token no longer works.'
    }

    return mode === 'created'
      ? 'Share the invite URL with the recipient. No email is sent by the API in this thin slice.'
      : 'Invite link rotated. Share the new URL; the previous token no longer works.'
  }

  private assertCanManageInvites(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    if (authContext.role !== 'owner' && authContext.role !== 'admin') {
      throw new ForbiddenException({
        message: 'Only owners and admins can manage workspace invites.',
      })
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  private usesMemoryStore() {
    return this.configService.get('NODE_ENV', { infer: true }) === 'test'
  }

  private resolveStatus(invite: InviteRow): WorkspaceInviteStatus {
    if (invite.revokedAt) {
      return 'revoked'
    }
    if (invite.acceptedAt) {
      return 'accepted'
    }
    if (Date.parse(invite.expiresAt) <= Date.now()) {
      return 'expired'
    }
    return 'pending'
  }

  private toPublicRecord(invite: InviteRow): WorkspaceInviteRecord {
    return {
      inviteId: invite.inviteId,
      workspaceId: invite.workspaceId,
      email: invite.email,
      role: invite.role,
      status: this.resolveStatus(invite),
      invitedByUserId: invite.invitedByUserId,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt,
      acceptedByUserId: invite.acceptedByUserId,
      revokedAt: invite.revokedAt,
      createdAt: invite.createdAt,
    }
  }

  private async persistInvite(invite: InviteRow) {
    if (this.usesMemoryStore()) {
      this.memoryInvites.set(invite.inviteId, invite)
      return
    }

    await this.postgresService.query(
      `
        INSERT INTO workspace_invites (
          invite_id,
          workspace_id,
          email,
          role,
          token_hash,
          invited_by_user_id,
          expires_at,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        invite.inviteId,
        invite.workspaceId,
        invite.email,
        invite.role,
        invite.tokenHash,
        invite.invitedByUserId,
        invite.expiresAt,
        invite.createdAt,
      ],
    )
  }

  private async loadInvites(workspaceId: string): Promise<InviteRow[]> {
    if (this.usesMemoryStore()) {
      return [...this.memoryInvites.values()]
        .filter((invite) => invite.workspaceId === workspaceId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    }

    const result = await this.postgresService.query<{
      invite_id: string
      workspace_id: string
      email: string
      role: WorkspaceInviteRole
      token_hash: string
      invited_by_user_id: string
      expires_at: Date
      accepted_at: Date | null
      accepted_by_user_id: string | null
      revoked_at: Date | null
      created_at: Date
    }>(
      `
        SELECT *
        FROM workspace_invites
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT 200
      `,
      [workspaceId],
    )

    return result.rows.map((row) => ({
      inviteId: row.invite_id,
      workspaceId: row.workspace_id,
      email: row.email,
      role: row.role,
      tokenHash: row.token_hash,
      invitedByUserId: row.invited_by_user_id,
      expiresAt: row.expires_at.toISOString(),
      acceptedAt: row.accepted_at?.toISOString(),
      acceptedByUserId: row.accepted_by_user_id ?? undefined,
      revokedAt: row.revoked_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
    }))
  }

  private async findByTokenHash(tokenHash: string): Promise<InviteRow | null> {
    if (this.usesMemoryStore()) {
      return (
        [...this.memoryInvites.values()].find(
          (invite) => invite.tokenHash === tokenHash,
        ) ?? null
      )
    }

    const result = await this.postgresService.query<{
      invite_id: string
      workspace_id: string
      email: string
      role: WorkspaceInviteRole
      token_hash: string
      invited_by_user_id: string
      expires_at: Date
      accepted_at: Date | null
      accepted_by_user_id: string | null
      revoked_at: Date | null
      created_at: Date
    }>(
      `
        SELECT *
        FROM workspace_invites
        WHERE token_hash = $1
        LIMIT 1
      `,
      [tokenHash],
    )
    const row = result.rows[0]
    if (!row) {
      return null
    }

    return {
      inviteId: row.invite_id,
      workspaceId: row.workspace_id,
      email: row.email,
      role: row.role,
      tokenHash: row.token_hash,
      invitedByUserId: row.invited_by_user_id,
      expiresAt: row.expires_at.toISOString(),
      acceptedAt: row.accepted_at?.toISOString(),
      acceptedByUserId: row.accepted_by_user_id ?? undefined,
      revokedAt: row.revoked_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
    }
  }

  private async findById(inviteId: string): Promise<InviteRow | null> {
    if (this.usesMemoryStore()) {
      return this.memoryInvites.get(inviteId) ?? null
    }

    const result = await this.postgresService.query<{
      invite_id: string
      workspace_id: string
      email: string
      role: WorkspaceInviteRole
      token_hash: string
      invited_by_user_id: string
      expires_at: Date
      accepted_at: Date | null
      accepted_by_user_id: string | null
      revoked_at: Date | null
      created_at: Date
    }>(
      `
        SELECT *
        FROM workspace_invites
        WHERE invite_id = $1
        LIMIT 1
      `,
      [inviteId],
    )
    const row = result.rows[0]
    if (!row) {
      return null
    }

    return {
      inviteId: row.invite_id,
      workspaceId: row.workspace_id,
      email: row.email,
      role: row.role,
      tokenHash: row.token_hash,
      invitedByUserId: row.invited_by_user_id,
      expiresAt: row.expires_at.toISOString(),
      acceptedAt: row.accepted_at?.toISOString(),
      acceptedByUserId: row.accepted_by_user_id ?? undefined,
      revokedAt: row.revoked_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
    }
  }

  private async markRevoked(input: { inviteId: string; revokedAt: string }) {
    if (this.usesMemoryStore()) {
      const current = this.memoryInvites.get(input.inviteId)
      if (!current) {
        return
      }
      this.memoryInvites.set(input.inviteId, {
        ...current,
        revokedAt: input.revokedAt,
      })
      return
    }

    await this.postgresService.query(
      `
        UPDATE workspace_invites
        SET revoked_at = $2
        WHERE invite_id = $1
      `,
      [input.inviteId, input.revokedAt],
    )
  }

  private async persistInviteRotation(invite: InviteRow) {
    if (this.usesMemoryStore()) {
      this.memoryInvites.set(invite.inviteId, {
        ...invite,
        acceptedAt: undefined,
        acceptedByUserId: undefined,
        revokedAt: undefined,
      })
      return
    }

    await this.postgresService.query(
      `
        UPDATE workspace_invites
        SET token_hash = $2,
            expires_at = $3,
            accepted_at = NULL,
            accepted_by_user_id = NULL,
            revoked_at = NULL
        WHERE invite_id = $1
      `,
      [invite.inviteId, invite.tokenHash, invite.expiresAt],
    )
  }

  private async markAccepted(input: {
    inviteId: string
    acceptedAt: string
    acceptedByUserId: string
  }) {
    if (this.usesMemoryStore()) {
      const current = this.memoryInvites.get(input.inviteId)
      if (!current) {
        return
      }
      this.memoryInvites.set(input.inviteId, {
        ...current,
        acceptedAt: input.acceptedAt,
        acceptedByUserId: input.acceptedByUserId,
      })
      return
    }

    await this.postgresService.query(
      `
        UPDATE workspace_invites
        SET accepted_at = $2,
            accepted_by_user_id = $3
        WHERE invite_id = $1
      `,
      [input.inviteId, input.acceptedAt, input.acceptedByUserId],
    )
  }
}
