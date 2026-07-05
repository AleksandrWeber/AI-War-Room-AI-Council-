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
import { ConsistencyAdminService } from './consistency-admin.service.js'

type ConsistencyAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('consistency')
export class ConsistencyController {
  constructor(
    private readonly consistencyAdminService: ConsistencyAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.consistencyAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConsistencyRollout() {
    return this.consistencyAdminService.getConsistencyRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConsistencyAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.consistencyAdminService.getWorkspaceConsistencyAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConsistencyAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConsistencyAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_consistency_summary') {
      throw new BadRequestException({
        message: 'Unsupported consistency admin action.',
      })
    }

    return this.consistencyAdminService.executeConsistencyAdminAction(
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
