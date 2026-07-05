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
import { StabilizabilityAdminService } from './stabilizability-admin.service.js'

type StabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('stabilizability')
export class StabilizabilityController {
  constructor(
    private readonly stabilizabilityAdminService: StabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.stabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getStabilizabilityRollout() {
    return this.stabilizabilityAdminService.getStabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceStabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.stabilizabilityAdminService.getWorkspaceStabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeStabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: StabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_stabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported stabilizability admin action.',
      })
    }

    return this.stabilizabilityAdminService.executeStabilizabilityAdminAction(
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
