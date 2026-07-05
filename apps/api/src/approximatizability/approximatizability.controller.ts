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
import { ApproximatizabilityAdminService } from './approximatizability-admin.service.js'

type ApproximatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('approximatizability')
export class ApproximatizabilityController {
  constructor(
    private readonly approximatizabilityAdminService: ApproximatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.approximatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getApproximatizabilityRollout() {
    return this.approximatizabilityAdminService.getApproximatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceApproximatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.approximatizabilityAdminService.getWorkspaceApproximatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeApproximatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ApproximatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_approximatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported approximatizability admin action.',
      })
    }

    return this.approximatizabilityAdminService.executeApproximatizabilityAdminAction(
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
