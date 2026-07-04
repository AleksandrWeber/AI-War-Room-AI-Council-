import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { UserProvisioningService } from '../workspaces/user-provisioning.service.js'
import { WorkspaceService } from '../workspaces/workspace.service.js'
import type { AuthenticatedRequest } from './workspace-access.guard.js'

type CreateSessionBody = {
  workspaceId?: unknown
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
    private readonly userProvisioningService: UserProvisioningService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.authService.getCapabilities()
  }

  @Post('session')
  async createSession(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateSessionBody,
  ) {
    this.authService.assertSessionBootstrapAccess(request)

    const userId = this.getSingleHeader(request.headers['x-user-id'])
    const headerWorkspaceId = this.getSingleHeader(
      request.headers['x-workspace-id'],
    )
    const bodyWorkspaceId =
      typeof body.workspaceId === 'string' && body.workspaceId.trim().length > 0
        ? body.workspaceId
        : null

    if (!userId || !headerWorkspaceId) {
      throw new UnauthorizedException({
        message: 'Missing x-user-id or x-workspace-id header.',
      })
    }

    const workspaceId = bodyWorkspaceId ?? headerWorkspaceId

    if (bodyWorkspaceId && headerWorkspaceId !== bodyWorkspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    await this.workspaceService.requireMembership({
      userId,
      workspaceId,
    })

    return this.authService.createSession({
      userId,
      workspaceId,
    })
  }

  @Post('provision')
  async provisionExternalAccess(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateSessionBody,
  ) {
    await this.authService.assertApiAccess(request)

    const identity = this.authService.resolveExternalAuthIdentity(request)

    if (!identity) {
      throw new UnauthorizedException({
        message: 'External auth provisioning requires an external provider token.',
      })
    }

    const workspaceId =
      (typeof body.workspaceId === 'string' && body.workspaceId.trim().length > 0
        ? body.workspaceId
        : null) ??
      identity.workspaceId ??
      this.getSingleHeader(request.headers['x-workspace-id'])

    if (!workspaceId) {
      throw new UnauthorizedException({
        message: 'Missing workspace context for external auth provisioning.',
      })
    }

    return this.userProvisioningService.provisionExternalMember({
      userId: identity.userId,
      workspaceId,
      email: identity.email,
      displayName: identity.subject,
    })
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
