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
import { ObservabilizabilityAdminService } from './observabilizability-admin.service.js'

type ObservabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('observabilizability')
export class ObservabilizabilityController {
  constructor(
    private readonly observabilizabilityAdminService: ObservabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.observabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getObservabilizabilityRollout() {
    return this.observabilizabilityAdminService.getObservabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceObservabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.observabilizabilityAdminService.getWorkspaceObservabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeObservabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ObservabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_observabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported observabilizability admin action.',
      })
    }

    return this.observabilizabilityAdminService.executeObservabilizabilityAdminAction(
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
