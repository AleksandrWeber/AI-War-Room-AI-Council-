import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { IdempotencyAdminService } from './idempotency-admin.service.js'

type IdempotencyAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('idempotency')
export class IdempotencyController {
  constructor(
    private readonly idempotencyAdminService: IdempotencyAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.idempotencyAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIdempotencyRollout() {
    return this.idempotencyAdminService.getIdempotencyRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIdempotencyAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.idempotencyAdminService.getWorkspaceIdempotencyAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIdempotencyAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IdempotencyAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (
      action !== 'refresh_idempotency_summary' &&
      action !== 'clear_workspace_idempotency_reservations' &&
      action !== 'purge_expired_idempotency_keys'
    ) {
      throw new BadRequestException({
        message: 'Unsupported idempotency admin action.',
      })
    }

    return this.idempotencyAdminService.executeIdempotencyAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }
}
