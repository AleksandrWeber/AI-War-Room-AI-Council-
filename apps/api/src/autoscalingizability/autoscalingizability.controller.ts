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
import { AutoscalingizabilityAdminService } from './autoscalingizability-admin.service.js'

type AutoscalingizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('autoscalingizability')
export class AutoscalingizabilityController {
  constructor(
    private readonly autoscalingizabilityAdminService: AutoscalingizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.autoscalingizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAutoscalingizabilityRollout() {
    return this.autoscalingizabilityAdminService.getAutoscalingizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAutoscalingizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.autoscalingizabilityAdminService.getWorkspaceAutoscalingizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAutoscalingizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AutoscalingizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_autoscalingizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported autoscalingizability admin action.',
      })
    }

    return this.autoscalingizabilityAdminService.executeAutoscalingizabilityAdminAction(
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
