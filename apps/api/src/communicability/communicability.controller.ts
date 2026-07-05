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
import { CommunicabilityAdminService } from './communicability-admin.service.js'

type CommunicabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('communicability')
export class CommunicabilityController {
  constructor(
    private readonly communicabilityAdminService: CommunicabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.communicabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCommunicabilityRollout() {
    return this.communicabilityAdminService.getCommunicabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCommunicabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.communicabilityAdminService.getWorkspaceCommunicabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCommunicabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CommunicabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_communicability_summary') {
      throw new BadRequestException({
        message: 'Unsupported communicability admin action.',
      })
    }

    return this.communicabilityAdminService.executeCommunicabilityAdminAction(
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
