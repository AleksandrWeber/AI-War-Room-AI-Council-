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
import { JoinizabilityAdminService } from './joinizability-admin.service.js'

type JoinizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('joinizability')
export class JoinizabilityController {
  constructor(
    private readonly joinizabilityAdminService: JoinizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.joinizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getJoinizabilityRollout() {
    return this.joinizabilityAdminService.getJoinizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceJoinizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.joinizabilityAdminService.getWorkspaceJoinizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeJoinizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: JoinizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_joinizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported joinizability admin action.',
      })
    }

    return this.joinizabilityAdminService.executeJoinizabilityAdminAction(
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
