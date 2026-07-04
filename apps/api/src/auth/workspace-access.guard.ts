import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type {
  AuthContext,
  AuthSessionClaims,
  ExternalAuthIdentity,
} from '@ai-war-room/schemas'
import { AuthService } from './auth.service.js'
import { WorkspaceService } from '../workspaces/workspace.service.js'

type WorkspaceRequestBody = {
  workspaceId?: unknown
  draftRun?: {
    workspaceId?: unknown
  }
}

export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>
  body?: WorkspaceRequestBody
  params?: Record<string, string | undefined>
  authContext?: AuthContext
  sessionClaims?: AuthSessionClaims
  externalAuthIdentity?: ExternalAuthIdentity
}

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    await this.authService.assertApiAccess(request)

    const authIdentity = this.authService.resolveAuthIdentity(request)
    const userId =
      authIdentity?.userId ?? this.getSingleHeader(request.headers['x-user-id'])
    const headerWorkspaceId =
      authIdentity?.workspaceId ??
      this.getSingleHeader(request.headers['x-workspace-id'])
    const bodyWorkspaceId = this.resolveBodyWorkspaceId(request.body)

    if (!userId || !headerWorkspaceId) {
      throw new UnauthorizedException({
        message: 'Missing x-user-id or x-workspace-id header.',
      })
    }

    const requestWorkspaceId = authIdentity
      ? (bodyWorkspaceId ?? authIdentity.workspaceId ?? headerWorkspaceId)
      : (bodyWorkspaceId ?? headerWorkspaceId)

    if (
      !authIdentity &&
      bodyWorkspaceId &&
      headerWorkspaceId !== bodyWorkspaceId
    ) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    request.authContext = await this.workspaceService.requireMembership({
      userId,
      workspaceId: requestWorkspaceId,
    })

    return true
  }

  private resolveBodyWorkspaceId(body?: WorkspaceRequestBody) {
    const workspaceId = body?.workspaceId ?? body?.draftRun?.workspaceId

    return typeof workspaceId === 'string' && workspaceId.trim().length > 0
      ? workspaceId
      : null
  }

  private getSingleHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
  }
}
