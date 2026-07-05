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
import { OrchestrizabilityAdminService } from './orchestrizability-admin.service.js'

type OrchestrizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('orchestrizability')
export class OrchestrizabilityController {
  constructor(
    private readonly orchestrizabilityAdminService: OrchestrizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.orchestrizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOrchestrizabilityRollout() {
    return this.orchestrizabilityAdminService.getOrchestrizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOrchestrizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.orchestrizabilityAdminService.getWorkspaceOrchestrizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOrchestrizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OrchestrizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_orchestrizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported orchestrizability admin action.',
      })
    }

    return this.orchestrizabilityAdminService.executeOrchestrizabilityAdminAction(
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
