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
import { ObservabilityAdminService } from './observability-admin.service.js'

type ObservabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('observability')
export class ObservabilityController {
  constructor(
    private readonly observabilityAdminService: ObservabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.observabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  getObservabilityRollout() {
    return this.observabilityAdminService.getObservabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceObservabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.observabilityAdminService.getWorkspaceObservabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeObservabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ObservabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (
      action !== 'refresh_event_summary' &&
      action !== 'clear_observability_buffer'
    ) {
      throw new BadRequestException({
        message: 'Unsupported observability admin action.',
      })
    }

    return this.observabilityAdminService.executeObservabilityAdminAction(
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
