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
import { RegressizabilityAdminService } from './regressizability-admin.service.js'

type RegressizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('regressizability')
export class RegressizabilityController {
  constructor(
    private readonly regressizabilityAdminService: RegressizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.regressizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegressizabilityRollout() {
    return this.regressizabilityAdminService.getRegressizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegressizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.regressizabilityAdminService.getWorkspaceRegressizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegressizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegressizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_regressizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported regressizability admin action.',
      })
    }

    return this.regressizabilityAdminService.executeRegressizabilityAdminAction(
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
