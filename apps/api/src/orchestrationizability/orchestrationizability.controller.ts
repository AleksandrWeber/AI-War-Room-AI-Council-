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
import { OrchestrationizabilityAdminService } from './orchestrationizability-admin.service.js'

type OrchestrationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('orchestrationizability')
export class OrchestrationizabilityController {
  constructor(
    private readonly orchestrationizabilityAdminService: OrchestrationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.orchestrationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOrchestrationizabilityRollout() {
    return this.orchestrationizabilityAdminService.getOrchestrationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOrchestrationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.orchestrationizabilityAdminService.getWorkspaceOrchestrationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOrchestrationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OrchestrationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_orchestrationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported orchestrationizability admin action.',
      })
    }

    return this.orchestrationizabilityAdminService.executeOrchestrationizabilityAdminAction(
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
