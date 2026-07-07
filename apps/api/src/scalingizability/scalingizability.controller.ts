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
import { ScalingizabilityAdminService } from './scalingizability-admin.service.js'

type ScalingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('scalingizability')
export class ScalingizabilityController {
  constructor(
    private readonly scalingizabilityAdminService: ScalingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.scalingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getScalingizabilityRollout() {
    return this.scalingizabilityAdminService.getScalingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceScalingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.scalingizabilityAdminService.getWorkspaceScalingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeScalingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ScalingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_scalingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported scalingizability admin action.',
      })
    }

    return this.scalingizabilityAdminService.executeScalingizabilityAdminAction(
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
