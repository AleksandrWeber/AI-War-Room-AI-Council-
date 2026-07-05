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
import { ContinuizabilityAdminService } from './continuizability-admin.service.js'

type ContinuizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('continuizability')
export class ContinuizabilityController {
  constructor(
    private readonly continuizabilityAdminService: ContinuizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.continuizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getContinuizabilityRollout() {
    return this.continuizabilityAdminService.getContinuizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceContinuizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.continuizabilityAdminService.getWorkspaceContinuizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeContinuizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ContinuizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_continuizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported continuizability admin action.',
      })
    }

    return this.continuizabilityAdminService.executeContinuizabilityAdminAction(
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
